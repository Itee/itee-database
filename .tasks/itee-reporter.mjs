import { SESSION_STATUS } from '@web/test-runner'
import colors             from 'ansi-colors'
import {
    existsSync,
    mkdirSync,
    writeFileSync
}                         from 'node:fs'
import {
    dirname,
    relative,
    resolve
}                         from 'node:path'

const yellow = colors.yellow
const green  = colors.green

export function iteeReporter( {
    reportResults = true,
    reportProgress = true,
    outputFilePath = '.reports/web_test_runner_report.json'
} = {} ) {

    const _reportResults  = reportResults
    const _reportProgress = reportProgress
    const _reportFilePath = resolve( outputFilePath )
    const _report         = {
        config:          {},
        sessions:        {},
        testCoverage:    {},
        testFiles:       [],
        browserNames:    [],
        focusedTestFile: null,
        startTime:       null,
        endTime:         null,
    }
    let _logger           = null
    let _debug            = null

    return {
        /**
         * Called once when the test runner starts.
         */
        start( {
            config,
            browserNames,
            testFiles,
            startTime
        } ) {
            _logger = config.logger
            _debug  = config.debug

            _report.config       = {
                browsers:            config.browsers.map( browser => ( {
                    name:        browser.name,
                    type:        browser.type,
                    concurrency: browser.concurrency,
                } ) ),
                browserLogs:         config.browserLogs,
                browserStartTimeout: config.browserStartTimeout,
                concurrency:         config.concurrency,
                concurrentBrowsers:  config.concurrentBrowsers,
                coverage:            config.coverage ?? false,
                coverageConfig:      config.coverageConfig,
                debug:               config.debug ?? false,
                files:               config.files,
                hostname:            config.hostname,
                logger:              config.logger.constructor.name,
                middleware:          [],
                nodeResolve:         config.nodeResolve,
                plugins:             config.plugins.map( plugin => ( {
                    name:            plugin.name,
                    injectWebSocket: plugin.injectWebSocket ?? false
                } ) ),
                port:                config.port,
                protocol:            config.protocol,
                reporters:           config.reporters.length,
                rootDir:             config.rootDir,
                testFramework:       ( config.testFramework ) ? relative( config.rootDir, config.testFramework.path ) : null,
                testRunnerHtml:      config.testRunnerHtml?.name,
                testsFinishTimeout:  config.testsFinishTimeout,
                testsStartTimeout:   config.testsStartTimeout,
                watch:               config.watch,
                http2:               config.http2 ?? null,
                sslKey:              config.sslKey ?? null,
                sslCert:             config.sslCert ?? null,
                manual:              config.manual ?? false,
                open:                config.open ?? false,
                mimeTypes:           config.mimeTypes ?? null,
            }
            _report.testFiles    = testFiles.map( testFile => relative( config.rootDir, testFile ) )
            _report.browserNames = browserNames
            _report.startTime    = startTime
        },

        /**
         * Called once when the test runner stops. This can be used to write a test
         * report to disk for regular test runs.
         */
        stop( {
            sessions,
            testCoverage,
            /*focusedTestFile*/
        } ) {
            if ( !_reportResults && _debug ) {
                _logger.warn( yellow( 'Do not report global results.' ) )
                return
            }


            // Update globals
            _report.endTime = ( new Date() ).getTime()

            // apply session map results
            for ( const session of sessions ) {
                _report.sessions[ session.id ] = {
                    id:    session.id,
                    group: {
                        name:           session.group.name,
                        testFiles:      session.group.testFiles,
                        browsers:       session.group.browsers.map( browser => ( {
                            name:        browser.name,
                            type:        browser.type,
                            concurrency: browser.concurrency,
                        } ) ),
                        sessionIds:     session.group.sessionIds,
                        testRunnerHtml: session.group.testRunnerHtml?.name,
                    },
                    // debug:   false, // Ignore because always false
                    browser:     {
                        name:        session.browser.name,
                        type:        session.browser.type,
                        concurrency: session.browser.concurrency,
                    },
                    testFile:    session.testFile,
                    testRun:     session.testRun,
                    status:      session.status,
                    passed:      session.passed,
                    errors:      session.errors,
                    testResults: session.testResults,
                    logs:        session.logs,
                    request404s: session.request404s,
                    // testCoverage: session.testCoverage,
                }
            }

            _report.testCoverage = ( testCoverage ) ? {
                passed:      testCoverage.passed,
                coverageMap: testCoverage.coverageMap.toJSON(),
                summary:     testCoverage.summary.toJSON(),
            } : null

            const outputDirectory = dirname( _reportFilePath )
            if ( !existsSync( outputDirectory ) ) {
                if ( _debug ) _logger.log( 'Creating', green( outputDirectory ) )
                mkdirSync( outputDirectory, { recursive: true } )
            }

            _logger.log( 'Generate', green( _reportFilePath ) )
            writeFileSync( _reportFilePath, JSON.stringify( _report, null, 2 ) )
        },

        onTestRunStarted( testRun ) {
            if ( _debug ) _logger.log( `onTestRunStarted: ${ testRun }` )
        },
        onTestRunFinished( testRun, sessions, testCoverage, focusedTestFile ) {
            if ( _debug ) _logger.log( `onTestRunFinished: ${ focusedTestFile }` )
        },
        reportTestFileResults( {
            logger,
            sessionsForTestFile,
            testFile,
            testRun
        } ) {
            if ( _debug ) _logger.log( `reportTestFileResults: ${ testFile }` )
        },

        /**
         * Called when test progress should be rendered to the terminal. This is called
         * any time there is a change in the test runner to display the latest status.
         *
         * This function should return the test report as a string. Previous results from this
         * function are overwritten each time it is called, they are rendered "dynamically"
         * to the terminal so that the progress bar is live updating.
         */
        getTestProgress( {
            config,
            sessions,
            testFiles,
            startTime,
            testRun,
            focusedTestFile,
            testCoverage,
        } ) {
            if ( !_reportProgress ) {
                return
            }

            const numberOfSessions = sessions.length
            const numberOfFinished = sessions.filter( session => session.status === SESSION_STATUS.FINISHED ).length

            let progress
            if ( numberOfFinished === numberOfSessions ) {
                progress = null
            } else {
                const advancementPercent = Math.round( ( numberOfFinished / numberOfSessions ) * 100 )
                progress                 = [
                    `Progress: ${ numberOfFinished }/${ numberOfSessions } (${ advancementPercent }%)`
                ]
            }

            return progress

        }

    }

}
