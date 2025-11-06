import {
    getConfig,
    sessionFailed,
    sessionFinished,
    sessionStarted,
} from '@web/test-runner-core/browser/session.js'

///////

class TestResultError {

    /**
     * @param {string} message
     * @param {string|null} name
     * @param {string|null} stack
     * @param {string|null} expected
     * @param {string|null} actual
     */
    constructor(
        message,
        name     = null,
        stack    = null,
        expected = null,
        actual   = null,
    ) {
        this.message  = message
        this.name     = name
        this.stack    = stack
        this.expected = expected
        this.actual   = actual
    }

}

class TestSuiteResult {

    /**
     *
     * @param {string} name
     * @param {Array.<TestSuiteResult>} suites
     * @param {Array.<TestResult>} tests
     */
    constructor( name, suites = [], tests = [] ) {
        this.name   = name
        this.suites = suites
        this.tests  = tests
    }

}

class TestResult {

    /**
     * @param {string} name
     * @param {boolean} passed
     * @param {boolean} skipped
     * @param {number|null} duration
     * @param {TestResultError|null} error
     */
    constructor( name, passed, skipped = false, duration = null, error = null, stats = null ) {
        this.name     = name
        this.passed   = passed
        this.skipped  = skipped
        this.duration = duration
        this.error    = error
        this.stats    = stats
    }

}

class TestSession {

    // BasicTestSession //
    // id: string;
    // group: TestSessionGroup;
    // browser: BrowserLauncher;
    // testFile: string;

    // TestSession //
    // debug: false;
    // testRun: number;
    // status: TestSessionStatus;
    // passed?: boolean;
    // errors: TestResultError[];
    // testResults?: TestSuiteResult;
    // logs: any[][];
    // request404s: string[];
    // testCoverage?: CoverageMapData;

    /**
     * @param {boolean|null} passed
     * @param {Array.<TestResultError>} errors
     * @param {TestSuiteResult|null} testResults
     */
    constructor( passed, errors = [], testResults = null ) {
        this.passed      = passed
        this.errors      = errors
        this.testResults = testResults
    }

}

///////

async function runTests( testData ) {

    let suiteResults = []
    for ( const exportKey in testData ) {
        const suite       = testData[ exportKey ]
        const suiteResult = await new Promise( ( resolve ) => {

            // suite.on( 'start', event => console.log )
            // suite.on( 'cycle', event => console.log )

            suite.on( 'complete', ( event ) => {
                // console.log(event.currentTarget)
                const testResults = event.currentTarget.map( target => new TestResult( target.name, true, false, target.hz, undefined, target.times ) )
                const suiteResult = new TestSuiteResult( suite.name, undefined, testResults )

                resolve( suiteResult )
            } )

            suite.run()

        } )

        suiteResults.push( suiteResult )
    }

    return {
        name:   'Benchmark',
        suites: suiteResults, // TestSuiteResult
        tests:  [], // TestResult
        passed: true
    }

}

( async () => {
    // notify the test runner that we're alive
    await sessionStarted()

    // fetch the config for this test run, this will tell you which file we're testing
    const {
              testFile,
              watch,
              debug,
              testFrameworkConfig
          } = await getConfig()

    // load the test file as an es module
    const failedImports = []
    let testData        = null
    try {
        const testFileURL = new URL( testFile, document.baseURI )
        testData          = await import(testFileURL.href)
    } catch ( error ) {
        failedImports.push( {
            file:  testFile,
            error: {
                message: error.message,
                stack:   error.stack
            }
        } )
    }

    try {
        // run the actual tests, this is what you need to implement
        const testResults   = await runTests( testData )
        // console.log( 'After runTests, testResults:', testResults )
        const passed        = failedImports.length === 0 && testResults.passed
        const sessionResult = new TestSession( passed, failedImports, testResults )

        // notify tests run finished
        await sessionFinished( sessionResult )
    } catch ( error ) {
        // notify an error occurred
        const sessionError = new TestResultError(
            error.message,
            error.name,
            error.stack
        )
        await sessionFailed( sessionError )
    }

} )()
