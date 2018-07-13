/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [MIT]{@link https://opensource.org/licenses/MIT}
 *
 * @module config/karmaBenchConfiguration
 *
 * @description The file manage the karma configuration for run benchmarks that are under `tests/benchmarks` folder
 *
 */

/* eslint-env node */

/**
 * Will assign an appropriate configuration object about benchmarks for karma.
 *
 * @param {object} config - The karma configuration object to extend
 */
function CreateKarmaBenchmarkConfiguration ( config ) {

    config.set( {

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '../',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [ 'benchmark' ],

        // list of files / patterns to load in the browser
        files: [
            'tests/itee-utils.benchs.js'
        ],

        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {},

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters:         [ 'benchmark' ],
        benchmarkReporter: {
            colors:           true,
            //            style: {
            //                benchmark: chalk.stripColor,
            //                summaryBenchmark: chalk.underline,
            //                summaryEmphasis: chalk.bold.underline,
            //                browser: chalk.blue,
            //                decorator: chalk.cyan,
            //                hz: chalk.green,
            //                hzUnits: chalk.italic.dim,
            //                suite: chalk.bold.magenta
            //            },
            decorator:        "*",
            terminalWidth:    60,
            hzWidth:          4,
            hzUnits:          "ops/sec",
            browserWidth:     40,
            showBrowser:      false,
            showSuiteSummary: true
            //            formatBenchmark: formatBenchmark,
            //            formatSuiteHeading: formatSuiteHeading,
            //            formatSuiteSummary: formatSuiteSummary
        },

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [ 'Chrome' ],
        //        browsers: ['Chrome', 'Firefox', 'Safari', 'IE'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: 1,

        // If, during test execution, Karma does not receive any message from a browser
        browserNoActivityTimeout: 60000,

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000

    } )

}

module.exports = CreateKarmaBenchmarkConfiguration
