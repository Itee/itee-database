/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Building
 *
 * @description The gulp tasks file. It allow to run some tasks from command line interface.<br>
 * The available tasks are:
 * <ul>
 * <li>help</li>
 * <li>clean</li>
 * <li>lint</li>
 * <li>doc</li>
 * <li>unit</li>
 * <li>bench</li>
 * <li>test</li>
 * <li>build-test</li>
 * <li>build</li>
 * <li>release</li>
 * </ul>
 * You could find a complet explanation about these tasks using: <b>npm run help</b>.
 *
 * @requires {@link module: [gulp]{@link https://github.com/gulpjs/gulp}}
 * @requires {@link module: [gulp-jsdoc3]{@link https://github.com/mlucool/gulp-jsdoc3}}
 * @requires {@link module: [gulp-eslint]{@link https://github.com/adametry/gulp-eslint}}
 * @requires {@link module: [del]{@link https://github.com/sindresorhus/del}}
 * @requires {@link module: [minimist]{@link https://github.com/substack/minimist}}
 * @requires {@link module: [rollup]{@link https://github.com/rollup/rollup}}
 * @requires {@link module: [path]{@link https://nodejs.org/api/path.html}}
 * @requires {@link module: [karma]{@link https://github.com/karma-runner/karma}}
 * @requires {@link module: [fancy-log]{@link https://github.com/js-cli/fancy-log}}
 * @requires {@link module: [ansi-colors]{@link https://github.com/doowb/ansi-colors}}
 *
 *
 */

/* eslint-env node */

const packageInfos = require( './package.json' )
const gulp         = require( 'gulp' )
const jsdoc        = require( 'gulp-jsdoc3' )
const eslint       = require( 'gulp-eslint' )
const replace      = require( 'gulp-replace' )
const del          = require( 'del' )
const parseArgs    = require( 'minimist' )
const rollup       = require( 'rollup' )
const path         = require( 'path' )
const karma        = require( 'karma' )
const log          = require( 'fancy-log' )
const colors       = require( 'ansi-colors' )
const red          = colors.red
const green        = colors.green
const blue         = colors.blue
const cyan         = colors.cyan
const yellow       = colors.yellow
const magenta      = colors.magenta

/**
 * @method npm run help ( default )
 * @global
 * @description Will display the help in console
 */
gulp.task( 'help', ( done ) => {

    log( '' )
    log( '====================================================' )
    log( '|                      HELP                        |' )
    log( '|                  Itee Database                   |' )
    log( `|                     v${packageInfos.version}                       |` )
    log( '====================================================' )
    log( '' )
    log( 'Available commands are:' )
    log( '\t', blue( 'npm run' ), cyan( 'help' ), ' - Display this help.' )
    log( '\t', blue( 'npm run' ), cyan( 'patch' ), ' - Will apply some patch/replacements in dependencies.', red( '(Apply only once after run "npm install")' ) )
    log( '\t', blue( 'npm run' ), cyan( 'clean' ), ' - Will delete builds and temporary folders.' )
    log( '\t', blue( 'npm run' ), cyan( 'lint' ), ' - Will run the eslint in pedantic mode with auto fix when possible.' )
    log( '\t', blue( 'npm run' ), cyan( 'doc' ), ' - Will run jsdoc, and create documentation under `documentation` folder, using the docdash theme' )
    log( '\t', blue( 'npm run' ), cyan( 'test' ), ' - Will run the test framworks (unit and bench), and create reports under `documentation/report` folder, using the mochawesome theme' )
    log( '\t', blue( 'npm run' ), cyan( 'unit' ), ' - Will run the karma server for unit tests.' )
    log( '\t', blue( 'npm run' ), cyan( 'bench' ), ' - Will run the karma server for benchmarks.' )
    log( '\t', blue( 'npm run' ), cyan( 'build' ), yellow( '--' ), green( '<options>' ), ' - Will build the application for development and/or production environments.', yellow( 'Note: The two dash are only required if you provide options !' ) )
    log( '\t\t The available', green( '<options>' ), 'are:' )
    log( '\t\t\t', green( '-n' ), 'or', green( '--name' ), ' - The export name of the builded application', red( '(required for UMD module)' ), cyan( '[Default: ""]' ), '.' )
    log( '\t\t\t', green( '-i' ), 'or', green( '--input' ), ' - The main file path to build', cyan( '[Default: "sources/main.js"]' ), '.' )
    log( '\t\t\t', green( '-o' ), 'or', green( '--output' ), ' - The folder where output the build', cyan( '[Default: "builds"]' ), '.' )
    log( '\t\t\t', green( '-f:' ), magenta( '<format>' ), 'or', green( '--format:' ), magenta( '<format>' ), ' - to specify the output build type. Where format could be any of:', magenta( 'amd' ), magenta( 'cjs' ), magenta( 'es' ), magenta( 'iife' ), magenta( 'umd' ), cyan( '[Default: "amd,cjs,es,iife,umd"]' ), '.' )
    log( '\t\t\t', green( '-e:' ), magenta( '<env>' ), 'or', green( '--env:' ), magenta( '<env>' ), ' - to specify the build environment. Where env could be any of:', magenta( 'dev' ), magenta( 'prod' ), cyan( '[Default: "dev"]' ), '.' )
    log( '\t\t\t', green( '-s' ), 'or', green( '--sourcemap' ), ' - to build with related source map', cyan( '[Default: true]' ), '.' )
    log( '\t\t\t', green( '-t' ), 'or', green( '--treeshake' ), ' - allow to perform treeshaking when building', cyan( '[Default: true]' ), '.' )
    log( '\t', blue( 'npm run' ), cyan( 'release' ), ' - Will run all the lint, test stuff, and if succeed will build the application.' )
    log( '' )
    log( 'In case you have', blue( 'gulp' ), 'installed globally, you could use also:' )
    log( '\t', blue( 'gulp' ), cyan( 'command' ), ' - It will perform the command like using "npm run" but with less characters to type... Because you\'re a developer, right ?' )
    log( '' )

    done()

} )

/**
 * @method npm run patch
 * @global
 * @description Will apply some patch/replacements in dependencies
 */
gulp.task( 'patch', () => {

    return gulp.src( [ 'node_modules/apoc/index.js' ] )
               .pipe( replace( '#! /usr/bin/env node\n', '' ) )
               .pipe( gulp.dest( 'node_modules/apoc/' ) )

} )

/**
 * @method npm run clean
 * @global
 * @description Will delete builds and temporary folders
 */
gulp.task( 'clean', () => {

    const filesToClean = [
        './builds',
        './tests/builds',
        './docs'
    ]

    return del( filesToClean )

} )

/**
 * @method npm run lint
 * @global
 * @description Will lint the sources files and try to fix the style when possible
 */
gulp.task( 'lint', () => {

    const filesToLint = [
        'gulpfile.js',
        'configs/**/*.js',
        'sources/**/*.js',
        'tests/**/*.js',
        '!tests/builds/*.js'
    ]

    return gulp.src( filesToLint, { base: './' } )
               .pipe( eslint( {
                   allowInlineConfig: true,
                   globals:           [],
                   fix:               true,
                   quiet:             false,
                   envs:              [],
                   configFile:        './configs/eslint.conf.js',
                   parserOptions:     {},
                   plugins:           [],
                   rules:             {},
                   useEslintrc:       false
               } ) )
               .pipe( eslint.format( 'stylish' ) )
               .pipe( gulp.dest( '.' ) )
               .pipe( eslint.failAfterError() )

} )

/**
 * @method npm run doc
 * @global
 * @description Will generate this documentation
 */
gulp.task( 'doc', ( done ) => {

    const config     = require( './configs/jsdoc.conf' )
    const filesToDoc = [
        'README.md',
        'gulpfile.js',
        './configs/*.js',
        './sources/**/*.js',
        './tests/**/*.js'
    ]

    gulp.src( filesToDoc, { read: false } )
        .pipe( jsdoc( config, done ) )

} )

/**
 * @method npm run unit
 * @global
 * @description Will run unit tests using karma
 */
gulp.task( 'unit', ( done ) => {

    const karmaServer = new karma.Server( {
        configFile: `${__dirname}/configs/karma.units.conf.js`,
        singleRun:  true
    }, ( exitCode ) => {

        if ( exitCode !== 0 ) {
            done( `Karma server exit with code ${exitCode}` )
        } else {
            log( `Karma server exit with code ${exitCode}` )
            done()
        }

    } )

    karmaServer.on( 'browser_error', ( browser, error ) => {
        log( red( error.message ) )
    } )

    karmaServer.start()

} )

/**
 * @method npm run bench
 * @global
 * @description Will run benchmarks using karma
 */
gulp.task( 'bench', ( done ) => {

    const karmaServer = new karma.Server( {
        configFile: `${__dirname}/configs/karma.benchs.conf.js`,
        singleRun:  true
    }, ( exitCode ) => {

        if ( exitCode !== 0 ) {
            done( `Karma server exit with code ${exitCode}` )
        } else {
            log( `Karma server exit with code ${exitCode}` )
            done()
        }

    } )

    karmaServer.on( 'browser_error', ( browser, error ) => {
        log( red( error.message ) )
    } )

    karmaServer.start()

} )

/**
 * @method npm run test
 * @global
 * @description Will run unit tests and benchmarks using karma
 */
gulp.task( 'test', gulp.series( 'unit', 'bench' ) )

/**
 * @method npm run build-test
 * @global
 * @description Will build itee client tests.
 */
gulp.task( 'build-test', ( done ) => {

    const configs = require( './configs/rollup.test.conf' )()

    nextBuild()

    function nextBuild ( error ) {
        'use strict'

        if ( error ) {

            done( error )

        } else if ( configs.length === 0 ) {

            done()

        } else {

            const config = configs.pop()
            log( `Building ${config.output.file}` )

            rollup.rollup( config )
                  .then( ( bundle ) => { return bundle.write( config.output ) } )
                  .then( () => { nextBuild() } )
                  .catch( nextBuild )

        }

    }

} )

/**
 * @method npm run build
 * @global
 * @description Will build itee client module using optional arguments. See help to further informations.
 */
gulp.task( 'build', ( done ) => {

    const options = parseArgs( process.argv, {
        string:  [ 'n', 'i', 'f', 'e' ],
        boolean: [ 's', 't' ],
        default: {
            n: 'Itee.Database',
            i: path.join( __dirname, 'sources', `${packageInfos.name}.js` ),
            o: path.join( __dirname, 'builds' ),
            f: 'esm,cjs',
            e: 'dev,prod',
            s: true,
            t: true
        },
        alias: {
            n: 'name',
            i: 'input',
            o: 'output',
            f: 'format',
            e: 'env',
            s: 'sourcemap',
            t: 'treeshake'
        }
    } )

    const configs = require( './configs/rollup.conf' )( options )

    nextBuild()

    function nextBuild ( error ) {
        'use strict'

        if ( error ) {

            done( error )

        } else if ( configs.length === 0 ) {

            done()

        } else {

            const config = configs.pop()
            log( `Building ${config.output.file}` )

            rollup.rollup( config )
                  .then( ( bundle ) => { return bundle.write( config.output ) } )
                  .then( () => { nextBuild() } )
                  .catch( nextBuild )

        }

    }

} )

/**
 * @method npm run release
 * @global
 * @description Will perform a complet release of the library including 'clean', 'lint', 'doc', 'build-test', 'test' and finally 'build'.
 */
gulp.task( 'release', gulp.series( 'clean', 'lint', 'doc', 'build-test', 'test', 'build' ) )

//---------

gulp.task( 'default', gulp.series( 'help' ) )
