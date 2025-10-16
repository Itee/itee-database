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
 * <li>patch</li>
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
 * @requires {@link module: [fancy-log]{@link https://github.com/js-cli/fancy-log}}
 * @requires {@link module: [ansi-colors]{@link https://github.com/doowb/ansi-colors}}
 *
 *
 */

/* eslint-env node */

import childProcess                from 'child_process'
import {nodeResolve}               from '@rollup/plugin-node-resolve'
import cleanup                     from 'rollup-plugin-cleanup'
import fs                          from 'fs'
import glob                        from 'glob'
import gulp                        from 'gulp'
import jsdoc                       from 'gulp-jsdoc3'
import eslint                      from 'gulp-eslint'
import { deleteAsync }             from 'del'
import parseArgs                   from 'minimist'
import { rollup }                  from 'rollup'
import path                        from 'path'
import log                         from 'fancy-log'
import colors                      from 'ansi-colors'
import { fileURLToPath }           from 'url'
import jsdocConfiguration          from './configs/jsdoc.conf.js'
import rollupConfigurator          from './configs/rollup.conf.js'
import rollupUnitTestsConfigurator from './configs/rollup.units.conf.js'
import rollupBenchesConfigurator   from './configs/rollup.benchs.conf.js'
import { getGulpConfigForTask }    from './configs/gulp.conf.mjs'

const red     = colors.red
const green   = colors.green
const blue    = colors.blue
const cyan    = colors.cyan
const yellow  = colors.yellow
const magenta = colors.magenta

// eslint-disable-next-line
const __dirname = path.dirname( fileURLToPath( import.meta.url ) )

const packageInfos = JSON.parse( fs.readFileSync(
    new URL( './package.json', import.meta.url )
) )

//---------

/**
 * @method npm run help ( default )
 * @global
 * @description Will display the help in console
 */
gulp.task( 'help', ( done ) => {

    function getPrettyPackageName() {

        let packageName = ''

        const nameSplits = packageInfos.name.split( '-' )
        for ( const nameSplit of nameSplits ) {
            packageName += nameSplit.charAt( 0 ).toUpperCase() + nameSplit.slice( 1 ) + ' '
        }
        packageName = packageName.slice( 0, -1 )

        return packageName

    }

    function getPrettyPackageVersion() {

        return 'v' + packageInfos.version

    }

    function getPrettyNodeVersion() {

        const nodeVersion = childProcess.execFileSync( 'node', [ '--version' ] )
                                        .toString()
                                        .replace( /(\r\n|\n|\r)/gm, '' )
        return ' node: ' + nodeVersion

    }

    function getPrettyNpmVersion() {

        const npmVersion = childProcess.execFileSync( 'npm', [ '--version' ] )
                                       .toString()
                                       .replace( /(\r\n|\n|\r)/gm, '' )

        return ' npm:  v' + npmVersion

    }

    function centerText( text, width ) {

        const textLength   = text.length
        const marginLength = ( width - textLength ) / 2

        let leftMargin, rightMargin
        if ( Number.isInteger( marginLength ) ) {
            leftMargin  = marginLength
            rightMargin = marginLength
        } else {
            const flooredMargin = Math.floor( marginLength )
            leftMargin          = flooredMargin
            rightMargin         = flooredMargin + 1
        }

        return ' '.repeat( leftMargin ) + text + ' '.repeat( rightMargin )

    }

    const bannerWidth          = 50
    const prettyPackageName    = getPrettyPackageName()
    const prettyPackageVersion = getPrettyPackageVersion()
    const prettyNodeVersion    = getPrettyNodeVersion()
    const nodeSpaceFilling     = ' '.repeat( bannerWidth - prettyNodeVersion.length )
    const prettyNpmVersion     = getPrettyNpmVersion()
    const npmSpaceFilling      = ' '.repeat( bannerWidth - prettyNpmVersion.length )

    const npmRun = blue( '\tnpm run' )

    log( '' )
    log( '┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓' )
    log( `┃${ centerText( 'HELP', bannerWidth ) }┃` )
    log( `┃${ centerText( prettyPackageName, bannerWidth ) }┃` )
    log( `┃${ centerText( prettyPackageVersion, bannerWidth ) }┃` )
    log( '┠──────────────────────────────────────────────────┨' )
    log( `┃${ prettyNodeVersion }${ nodeSpaceFilling }┃` )
    log( `┃${ prettyNpmVersion }${ npmSpaceFilling }┃` )
    log( '┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛' )
    log( '' )
    log( 'Available commands are:' )
    log( npmRun, cyan( 'help' ), ' - Display this help.' )
    log( npmRun, cyan( 'patch' ), ' - Will apply some patch/replacements in dependencies.', red( '(Apply only once after run "npm install")' ) )
    log( npmRun, cyan( 'clean' ), ' - Will delete builds and temporary folders.' )
    log( npmRun, cyan( 'lint' ), ' - Will run the eslint in pedantic mode with auto fix when possible.' )
    log( npmRun, cyan( 'doc' ), ' - Will run jsdoc, and create documentation under `documentation` folder, using the docdash theme' )
    log( npmRun, cyan( 'test' ), ' - Will run the test framworks (unit and bench), and create reports under `documentation/report` folder, using the mochawesome theme' )
    log( npmRun, cyan( 'unit' ), ' - Will run the karma server for unit tests.' )
    log( npmRun, cyan( 'bench' ), ' - Will run the karma server for benchmarks.' )
    log( npmRun, cyan( 'build' ), yellow( '--' ), green( '<options>' ), ' - Will build the application for development and/or production environments.' )
    log( yellow( '\tNote: The two dash are only required if you provide options !' ) )
    log( '\t\t The available', green( '<options>' ), 'are:' )
    log( '\t\t\t', green( '-i' ), 'or', green( '--input' ), ' - The main file path to build', cyan( '[Default: "sources/main.js"]' ), '.' )
    log( '\t\t\t', green( '-o' ), 'or', green( '--output' ), ' - The folder where output the build', cyan( '[Default: "builds"]' ), '.' )
    log(
        '\t\t\t',
        green( '-f:' ),
        magenta( '<format>' ),
        'or',
        green( '--format:' ),
        magenta( '<format>' ),
        ' - to specify the output build type. Where format could be any of:', magenta( 'cjs, esm, iife, umd' ), '.'
    )
    log( '\t\t\t', green( '-e:' ), magenta( '<env>' ), 'or', green( '--env:' ), magenta( '<env>' ), ' - to specify the build environment. Where env could be any of:', magenta(
        'dev' ), magenta( 'prod' ), cyan( '[Default: "dev"]' ), '.' )
    log( '\t\t\t', green( '-s' ), 'or', green( '--sourcemap' ), ' - to build with related source map', cyan( '[Default: true]' ), '.' )
    log( '\t\t\t', green( '-t' ), 'or', green( '--treeshake' ), ' - allow to perform treeshaking when building', cyan( '[Default: true]' ), '.' )
    log( npmRun, cyan( 'release' ), ' - Will run all the lint, test stuff, and if succeed will build the application.' )
    log( '' )
    log( 'In case you have', blue( 'gulp' ), 'installed globally, you could use also:' )
    log( '\t', blue( 'gulp' ), cyan( 'command' ), ' - It will perform the command like using "npm run" but with less characters to type... Because you\'re a developer, right ?' )
    log( '' )

    done()

} )

//---------

/**
 * @method npm run patch
 * @global
 * @description Will apply some patch/replacements in dependencies
 */
gulp.task( 'patch', ( done ) => {

    done()

} )

//---------

/**
 * @method npm run clean
 * @global
 * @description Will delete builds and temporary folders
 */
gulp.task( 'clean', () => {

    const filesToClean = getGulpConfigForTask( 'clean' )
    return deleteAsync( filesToClean )

} )

//---------

/**
 * @method npm run lint
 * @global
 * @description Will lint the sources files and try to fix the style when possible
 */
gulp.task( 'lint', () => {

    const filesToLint = getGulpConfigForTask( 'lint' )

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

//---------

/**
 * @method npm run doc
 * @global
 * @description Will generate this documentation
 */
gulp.task( 'doc', ( done ) => {

    const config     = jsdocConfiguration
    const filesToDoc = getGulpConfigForTask( 'doc' )

    gulp.src( filesToDoc, { read: false } )
        .pipe( jsdoc( config, done ) )

} )

//---------

/**
 * @description In view to detect bundling side effects this task will
 * create intermediary file for each individual export from this package
 * and then create rollup config for each of them and bundle
 * Todo: Check for differents target env like next task below this one
 */
gulp.task( 'check-bundling-from-esm-files-import', async ( done ) => {

    const baseDir           = __dirname
    const sourcesDir        = path.join( baseDir, 'sources' )
    const testsDir          = path.join( baseDir, 'tests' )
    const bundleDir         = path.join( testsDir, 'bundles' )
    const outputDir         = path.join( bundleDir, 'from_files_import' )
    const temporariesDir    = path.join( outputDir, '.tmp' )
    const filePathsToIgnore = getGulpConfigForTask( 'check-bundling' )

    if ( fs.existsSync( outputDir ) ) {
        log( 'Clean up', magenta( outputDir ) )
        fs.rmSync( outputDir, { recursive: true } )
    }

    let sourcesGlob    = path.join( sourcesDir, '/**' )
    // sourcesGlob        = sourcesGlob.replaceAll( '\\', '/' )
    const sourcesFiles = glob.sync( sourcesGlob )
                             .map( filePath => {
                                 return path.normalize( filePath )
                             } )
                             .filter( filePath => {
                                 const fileName         = path.basename( filePath )
                                 const isJsFile         = fileName.endsWith( '.js' )
                                 const isNotPrivateFile = !fileName.startsWith( '_' )
                                 const isNotIgnoredFile = !filePathsToIgnore.includes( fileName )
                                 return isJsFile && isNotPrivateFile && isNotIgnoredFile
                             } )

    for ( let sourceFile of sourcesFiles ) {

        const {
                  dir:  sourceDir,
                  base: sourceBase,
                  name: sourceName
              }                = path.parse( sourceFile )
        const specificFilePath = sourceFile.replace( sourcesDir, '' )
        const specificDir      = path.dirname( specificFilePath )

        // Create temp import file per file in package
        const temporaryFileName = `${ sourceName }.import.js`
        const temporaryDir      = path.join( temporariesDir, specificDir )
        const temporaryFile     = path.join( temporaryDir, temporaryFileName )
        const importDir         = path.relative( temporaryDir, sourceDir )
        const importFile        = path.join( importDir, sourceBase )
        const temporaryFileData = `import '${ importFile.replace( /\\/g, '/' ) }'`

        // Bundle tmp file and check content for side effects
        const bundleFileName = `${ sourceName }.bundle.js`
        const bundleFilePath = path.join( outputDir, specificDir, bundleFileName )

        const config = {
            input:     temporaryFile,
            plugins:   [
                nodeResolve(),
                cleanup( {
                    comments: 'all' // else remove __PURE__ declaration... -_-'
                } )
            ],
            onwarn:    ( {
                loc,
                frame,
                message
            } ) => {

                // Ignore some errors
                if ( message.includes( 'Circular dependency' ) ) { return }
                if ( message.includes( 'Generated an empty chunk' ) ) { return }

                if ( loc ) {
                    process.stderr.write( `/!\\ ${ loc.file } (${ loc.line }:${ loc.column }) ${ frame } ${ message }\n` )
                } else {
                    process.stderr.write( `/!\\ ${ message }\n` )
                }

            },
            treeshake: {
                moduleSideEffects:                true,
                annotations:                      true,
                correctVarValueBeforeDeclaration: true,
                propertyReadSideEffects:          true,
                tryCatchDeoptimization:           true,
                unknownGlobalSideEffects:         true
            },
            output:    {
                indent: '\t',
                format: 'esm',
                file:   bundleFilePath
            }
        }

        // create tmp file
        try {

            fs.mkdirSync( temporaryDir, { recursive: true } )
            fs.writeFileSync( temporaryFile, temporaryFileData )

            const bundle     = await rollup( config )
            const { output } = await bundle.generate( config.output )

            let code = output[ 0 ].code
            if ( code.length > 1 ) {
                log( red( `[${ specificFilePath }] contain side-effects !` ) )
                await bundle.write( config.output )
            } else {
                log( green( `[${ specificFilePath }] is side-effect free.` ) )
            }

        } catch ( error ) {
            log( red( error.message ) )
        }

    }

    done()

} )
gulp.task( 'check-bundling-from-esm-build-import', async ( done ) => {

    const baseDir        = __dirname
    const buildsDir      = path.join( baseDir, 'builds' )
    const buildFilePath  = path.join( buildsDir, `${ packageInfos.name }.esm.js` )
    const testsDir       = path.join( baseDir, 'tests' )
    const bundlesDir     = path.join( testsDir, 'bundles' )
    const outputDir      = path.join( bundlesDir, 'from_build_import' )
    const temporaryDir   = path.join( bundlesDir, 'from_build_import', '.tmp' )
    const importDir      = path.relative( temporaryDir, buildsDir )
    const importFilePath = path.join( importDir, `${ packageInfos.name }.esm.js` )

    if ( fs.existsSync( outputDir ) ) {
        log( 'Clean up', magenta( outputDir ) )
        fs.rmSync( outputDir, { recursive: true } )
    }

    try {

        // Get build exports list
        const data  = fs.readFileSync( buildFilePath, 'utf8' )
        const regex = /export\s{\s(.*)\s}/
        const found = data.match( regex )
        if ( found === null ) {
            log( red( `Unable to find exports in ${ buildFilePath }` ) )
            return
        }

        const exports = found[ 1 ].split( ',' )
                                  .map( item => item.trim() )

        // Create temporary imports files for each build export
        // And then bundle it
        let temporaryFilePaths = []
        for ( let namedExport of exports ) {
            if ( namedExport.includes( ' as ' ) ) {
                namedExport = namedExport.split( ' as ' )[ 1 ]
            }

            const temporaryFileName = `${ namedExport }.import.js`
            const temporaryFilePath = path.join( temporaryDir, temporaryFileName )
            const temporaryFileData = `import { ${ namedExport } } from '${ importFilePath.replace( /\\/g, '/' ) }'`

            fs.mkdirSync( temporaryDir, { recursive: true } )
            fs.writeFileSync( temporaryFilePath, temporaryFileData )

            temporaryFilePaths.push( temporaryFilePath )
        }

        // Bundle each temporary files and check side-effects
        const config = {
            input:     null,
            external:  [ '' ],
            plugins:   [
                nodeResolve( {
                    preferBuiltins: true
                } ),
                cleanup( {
                    comments: 'all' // else remove __PURE__ declaration... -_-'
                } )
            ],
            onwarn:    ( {
                loc,
                frame,
                message
            } ) => {

                // Ignore some errors
                if ( message.includes( 'Circular dependency' ) ) { return }
                if ( message.includes( 'Generated an empty chunk' ) ) { return }

                if ( loc ) {
                    process.stderr.write( `/!\\ ${ loc.file } (${ loc.line }:${ loc.column }) ${ frame } ${ message }\n` )
                } else {
                    process.stderr.write( `/!\\ ${ message }\n` )
                }

            },
            treeshake: {
                moduleSideEffects:                true,
                annotations:                      true,
                correctVarValueBeforeDeclaration: true,
                propertyReadSideEffects:          true,
                tryCatchDeoptimization:           true,
                unknownGlobalSideEffects:         true
            },
            output:    {
                indent: '\t',
                format: 'esm',
                file:   null
            }
        }
        let fileName, bundleFileName, bundleFilePath
        for ( const temporaryFilePath of temporaryFilePaths ) {

            fileName       = path.basename( temporaryFilePath )
            bundleFileName = fileName.replace( '.tmp.', '.bundle.' )
            bundleFilePath = path.join( outputDir, bundleFileName )

            try {

                config.input       = temporaryFilePath
                config.output.file = bundleFilePath

                const bundle     = await rollup( config )
                const { output } = await bundle.generate( config.output )

                let code = output[ 0 ].code
                if ( code.length > 1 ) {
                    log( red( `[${ bundleFileName }] contain side-effects !` ) )
                    await bundle.write( config.output )
                } else {
                    log( green( `[${ bundleFileName }] is side-effect free.` ) )
                }

            } catch ( error ) {

                log( red( error.message ) )

            }
        }

    } catch ( err ) {
        log( red( error.message ) )
    } finally {

        done()

    }

} )
gulp.task( 'check-bundling-from-esm-files-direct', async ( done ) => {

    const baseDir           = __dirname
    const sourcesDir        = path.join( baseDir, 'sources' )
    const testsDir          = path.join( baseDir, 'tests' )
    const bundlesDir        = path.join( testsDir, 'bundles' )
    const outputDir         = path.join( bundlesDir, 'from_files_direct' )
    const filePathsToIgnore = getGulpConfigForTask( 'check-bundling' )

    if ( fs.existsSync( outputDir ) ) {
        log( 'Clean up', magenta( outputDir ) )
        fs.rmSync( outputDir, { recursive: true } )
    }

    const sourcesFiles = glob.sync( path.join( sourcesDir, '**' ) )
                             .map( filePath => path.normalize( filePath ) )
                             .filter( filePath => {
                                 const fileName         = path.basename( filePath )
                                 const isJsFile         = fileName.endsWith( '.js' )
                                 const isNotPrivateFile = !fileName.startsWith( '_' )
                                 const isNotIgnoredFile = !filePathsToIgnore.includes( fileName )
                                 return isJsFile && isNotPrivateFile && isNotIgnoredFile
                             } )

    for ( let sourceFile of sourcesFiles ) {

        const specificFilePath = sourceFile.replace( sourcesDir, '' )
        const specificDir      = path.dirname( specificFilePath )
        const fileName         = path.basename( sourceFile, path.extname( sourceFile ) )

        const bundleFileName = `${ fileName }.bundle.js`
        const bundleFilePath = path.join( outputDir, specificDir, bundleFileName )

        const config = {
            input:     sourceFile,
            external:  [ '' ],
            plugins:   [
                nodeResolve( {
                    preferBuiltins: true
                } ),
                cleanup( {
                    comments: 'none'
                } )
            ],
            onwarn:    ( {
                loc,
                frame,
                message
            } ) => {

                // Ignore some errors
                if ( message.includes( 'Circular dependency' ) ) { return }
                if ( message.includes( 'Generated an empty chunk' ) ) { return }

                if ( loc ) {
                    process.stderr.write( `/!\\ ${ loc.file } (${ loc.line }:${ loc.column }) ${ frame } ${ message }\n` )
                } else {
                    process.stderr.write( `/!\\ ${ message }\n` )
                }

            },
            treeshake: {
                moduleSideEffects:                true,
                annotations:                      true,
                correctVarValueBeforeDeclaration: true,
                propertyReadSideEffects:          true,
                tryCatchDeoptimization:           true,
                unknownGlobalSideEffects:         true
            },
            output:    {
                indent: '\t',
                format: 'esm',
                file:   bundleFilePath
            }
        }

        try {

            log( `Building bundle ${ config.output.file }` )

            const bundle = await rollup( config )
            await bundle.generate( config.output )
            await bundle.write( config.output )

        } catch ( error ) {

            log( red( error.message ) )

        }

    }

    done()

} )
gulp.task( 'check-bundling', gulp.series( 'check-bundling-from-esm-files-import', 'check-bundling-from-esm-build-import', 'check-bundling-from-esm-files-direct' ) )

/**
 * @description Will generate unit test files from source code using type inference from comments
 */
gulp.task( 'compute-unit-tests', async ( done ) => {

    const basePath   = __dirname
    const sourcesDir = path.join( basePath, 'sources' )
    const testsDir   = path.join( basePath, 'tests' )
    const unitsDir   = path.join( testsDir, 'units' )

    fs.mkdirSync( unitsDir, { recursive: true } )

    const filePathsToIgnore = getGulpConfigForTask( 'compute-unit-tests' )

    const sourcesFiles = glob.sync( path.join( sourcesDir, '**' ) )
                             .map( filePath => path.normalize( filePath ) )
                             .filter( filePath => {
                                 const fileName         = path.basename( filePath )
                                 const isJsFile         = fileName.endsWith( '.js' )
                                 const isNotPrivateFile = !fileName.startsWith( '_' )
                                 const isNotIgnoredFile = !filePathsToIgnore.includes( fileName )
                                 return isJsFile && isNotPrivateFile && isNotIgnoredFile
                             } )

    const unitsImportMap = []
    for ( let sourceFile of sourcesFiles ) {

        const specificFilePath = sourceFile.replace( sourcesDir, '' )
        const specificDir      = path.dirname( specificFilePath )

        const fileName     = path.basename( sourceFile, path.extname( sourceFile ) )
        const unitFileName = `${ fileName }.unit.js`
        const unitDirPath  = path.join( unitsDir, specificDir )
        const unitFilePath = path.join( unitDirPath, unitFileName )

        const nsName         = `${ fileName }Namespace`
        const unitName       = `${ fileName }Units`
        const importDirPath  = path.relative( unitDirPath, sourcesDir )
        const importFilePath = path.join( importDirPath, specificFilePath )
                                   .replace( /\\/g, '/' )

        try {

            const jsdocPath   = path.join( basePath, '/node_modules/jsdoc/jsdoc.js' )
            const jsdocOutput = childProcess.execFileSync( 'node', [ jsdocPath, '-X', sourceFile ] )
                                            .toString()

            const classNames    = []
            const usedLongnames = []
            const jsonData      = JSON.parse( jsdocOutput ).filter( data => {

                const longName = data.longname

                const kind = data.kind
                if ( kind !== 'function' ) {
                    if ( kind === 'class' && !classNames.includes( longName ) ) {
                        classNames.push( longName )
                    }
                    return false
                }

                const undocumented = data.undocumented
                if ( undocumented ) {
                    return false
                }

                const scope = data.scope
                if ( ![ 'global', 'static' ].includes( scope ) ) {
                    return false
                }

                if ( longName.includes( ' ' ) || longName.includes( '~' ) || usedLongnames.includes( longName ) ) {
                    return false
                }

                for ( let className of classNames ) {
                    if ( longName.includes( className ) ) {
                        return false
                    }
                }

                usedLongnames.push( longName )

                return true

            } )

            if ( jsonData.length === 0 ) {
                log( yellow( `No usable exports found in [${ sourceFile }]. Ignore it !` ) )
                continue
            }

            let describes = ''
            const I       = n => '\t'.repeat( n )
            I._           = I( 1 )
            I.__          = I( 2 )
            I.___         = I( 3 )
            I.____        = I( 4 )
            I._____       = I( 5 )

            for ( let docData of jsonData ) {

                try {

                    //check input parameters and types
                    const docParameters = docData.params || []
                    const parameters    = []
                    for ( let pIndex = 0 ; pIndex < docParameters.length ; pIndex++ ) {
                        const param   = docParameters[ pIndex ]
                        let paramName = param.name
                        if ( !paramName ) {
                            paramName = `param${ pIndex }`
                            // eslint-disable-next-line no-console
                            console.warn( `Missing parameter name for [${ docData.longname }]. Defaulting to [${ paramName }]` )
                        }

                        const paramType = param.type
                        if ( !paramType ) {
                            throw new ReferenceError( `Missing parameter type. Unable to create unit test for [${ docData.longname }] !` )
                        }

                        const parameter = {
                            name:  paramName,
                            types: []
                        }

                        const paramTypeNames = paramType.names
                        for ( let type of paramTypeNames ) {
                            parameter.types.push( type )
                        }

                        parameters.push( parameter )
                    }

                    // Check returns types
                    const docReturns = docData.returns || []
                    const returns    = []
                    for ( let docReturn of docReturns ) {
                        const returnType = docReturn.type
                        if ( !returnType ) {
                            throw new ReferenceError( `Missing return type for [${ docData.longname }]. Ignore current target !` )
                        }
                        returns.push( ...returnType.names )
                    }

                    // Todo check throws

                    // Get user define rules
                    // const rules = []


                    // Infer basic rules
                    let its = ''

                    if ( parameters.length === 0 ) {

                        if ( returns.length === 0 ) {

                            const result = `${ I( 1 + 1 + 1 + 1 ) }const result = ${ nsName }.${ docData.name }()` + '\n'
                            const expect = `${ I( 1 + 1 + 1 + 1 ) }expect(result).to.be.a('undefined')` + '\n'

                            its += '' +
                                `${ I( 1 + 1 + 1 ) }it( 'return type is undefined', () => {` + '\n' +
                                '\n' +
                                `${ result }` +
                                `${ expect }` +
                                '\n' +
                                `${ I( 1 + 1 + 1 ) }} )` + '\n'

                        } else if ( returns.length === 1 ) {

                            const firstReturnType = returns[ 0 ]
                            const lowerName       = firstReturnType.toLowerCase()

                            const result = `${ I( 1 + 1 + 1 + 1 ) }const result = ${ nsName }.${ docData.name }()` + '\n'

                            let expect = ''
                            if ( lowerName.startsWith( 'array' ) ) {
                                //todo array of...
                                expect += `${ I( 1 + 1 + 1 + 1 ) }expect(result).to.be.a('array')` + '\n'
                            } else {
                                expect += `${ I( 1 + 1 + 1 + 1 ) }expect(result).to.be.a('${ lowerName }')` + '\n'
                            }

                            its += '' +
                                `${ I( 1 + 1 + 1 ) }it( 'return type is ${ lowerName }', () => {` + '\n' +
                                '\n' +
                                `${ result }` +
                                `${ expect }` +
                                '\n' +
                                `${ I( 1 + 1 + 1 ) }} )` + '\n'

                        } else {

                            const result = `${ I( 1 + 1 + 1 + 1 ) }const result = ${ nsName }.${ docData.name }()` + '\n'

                            let returnTypesLabel = []
                            let expects          = []
                            for ( let returnType of returns ) {

                                const lowerName = returnType.toLowerCase()
                                returnTypesLabel.push( lowerName )

                                if ( lowerName.startsWith( 'array' ) ) {
                                    expects.push( `expect(result).to.be.a('array')` )
                                    //todo array of...
                                } else {
                                    expects.push( `expect(result).to.be.a('${ lowerName }')` )
                                }

                            }

                            let indent   = 1 + 1 + 1 + 1
                            let openTry  = ''
                            let closeTry = ''
                            for ( let expect of expects ) {
                                openTry += '' +
                                    `${ I( indent ) }try {` + '\n' +
                                    `${ I( indent + 1 ) }${ expect }` + '\n' +
                                    `${ I( indent ) }} catch(e) {` + '\n'

                                closeTry = `${ I( indent ) }}` + '\n' + `${ closeTry }`

                                indent++
                            }
                            const _expect = '' +
                                `${ openTry }` +
                                `${ I( indent ) }expect.fail("expect result to be of type ${ returnTypesLabel.join( ' or ' ) }")` + '\n' +
                                `${ closeTry }`

                            its += '' +
                                `${ I( 1 + 1 + 1 ) }it( 'return type is ${ returnTypesLabel.join( ' or ' ) }', () => {` + '\n' +
                                '\n' +
                                `${ result }` +
                                `${ _expect }` +
                                '\n' +
                                `${ I( 1 + 1 + 1 ) }} )` + '\n'

                        }

                    } else {

                        if ( returns.length === 0 ) {

                            let itDeclaration = []
                            let index         = 0
                            let indent        = 1 + 1 + 1 + 1
                            let localIndent   = indent
                            let dataSets      = ''
                            let forLoopOpens  = ''
                            let forLoopCloses = ''
                            let args          = []
                            for ( let parameter of parameters ) {

                                const parameterType = parameter.types[ 0 ]
                                itDeclaration.push( `${ parameter.name } is of type ${ parameterType }` )

                                dataSets += `${ I( indent ) }const dataSet${ index } = this._dataMap[ '${ parameterType }s' ]` + '\n'
                                forLoopOpens += '' + '\n' +
                                    `${ I( localIndent ) }for ( let key${ index } in dataSet${ index } ) {` + '\n' +
                                    `${ I( localIndent + 1 ) }const dataSetValue${ index } = dataSet${ index }[ key${ index } ]` + '\n'

                                args.push( `dataSetValue${ index }` )

                                forLoopCloses = `${ I( localIndent ) }}` + '\n' + `${ forLoopCloses }`

                                index++
                                localIndent++
                            }

                            const result = `${ I( localIndent ) }const result = ${ nsName }.${ docData.name }( ${ args.join( ', ' ) } )` + '\n'
                            const expect = `${ I( localIndent ) }expect(result).to.be.a('undefined')` + '\n'

                            const param = '' +
                                `${ dataSets }` +
                                `${ forLoopOpens }` +
                                `${ result }` +
                                `${ expect }` +
                                `${ forLoopCloses }`

                            its += '' +
                                `${ I( 1 + 1 + 1 ) }it( 'return type is undefined when ${ itDeclaration.join( ' and ' ) }', () => {` + '\n' +
                                '\n' +
                                `${ param }` +
                                '\n' +
                                `${ I( 1 + 1 + 1 ) }} )` + '\n'

                        } else if ( returns.length === 1 ) {

                            const firstReturnType = returns[ 0 ]
                            const lowerName       = firstReturnType.toLowerCase()

                            let itDeclaration = []
                            let index         = 0
                            let indent        = 1 + 1 + 1 + 1
                            let localIndent   = indent
                            let dataSets      = ''
                            let forLoopOpens  = ''
                            let forLoopCloses = ''
                            let args          = []
                            for ( let parameter of parameters ) {

                                const parameterType = parameter.types[ 0 ]
                                const isAnyType     = ( parameterType === '*' || parameterType.toLowerCase() === 'any' )
                                const declaration   = ( isAnyType )
                                                      ? `${ parameter.name } is of any type`
                                                      : `${ parameter.name } is of type ${ parameterType }`
                                itDeclaration.push( declaration )

                                if ( isAnyType ) {

                                    dataSets += `${ I( indent ) }const dataMap${ index } = this._dataMap` + '\n' +
                                        `${ I( localIndent ) }for ( let dataSetKey${ index } in dataMap${ index } ) {` + '\n'

                                    localIndent++
                                    dataSets += `${ I( indent + 1 ) }const dataSet${ index } = dataMap${ index }[ dataSetKey${ index } ]` + '\n'
                                    forLoopOpens += '' + '\n' +
                                        `${ I( localIndent ) }for ( let key${ index } in dataSet${ index } ) {` + '\n' +
                                        `${ I( localIndent + 1 ) }const dataSetValue${ index } = dataSet${ index }[ key${ index } ]` + '\n'

                                    args.push( `dataSetValue${ index }` )

                                    forLoopCloses = `${ I( localIndent ) }}` + '\n' +
                                        `${ I( localIndent - 1 ) }}` + '\n' +
                                        `${ forLoopCloses }`

                                } else {

                                    dataSets += `${ I( indent ) }const dataSet${ index } = this._dataMap[ '${ parameterType }s' ]` + '\n'
                                    forLoopOpens += '' + '\n' +
                                        `${ I( localIndent ) }for ( let key${ index } in dataSet${ index } ) {` + '\n' +
                                        `${ I( localIndent + 1 ) }const dataSetValue${ index } = dataSet${ index }[ key${ index } ]` + '\n'

                                    args.push( `dataSetValue${ index }` )

                                    forLoopCloses = `${ I( localIndent ) }}` + '\n' + `${ forLoopCloses }`

                                }


                                index++
                                localIndent++
                            }

                            const result = `${ I( localIndent ) }const result = ${ nsName }.${ docData.name }( ${ args.join( ', ' ) } )` + '\n'

                            let expect = ''
                            if ( lowerName.startsWith( 'array' ) ) {
                                expect = `${ I( localIndent ) }expect(result).to.be.a('array')` + '\n'
                                //todo array of...
                            } else {
                                expect = `${ I( localIndent ) }expect(result).to.be.a('${ lowerName }')` + '\n'
                            }

                            const param = '' +
                                `${ dataSets }` +
                                `${ forLoopOpens }` +
                                `${ result }` +
                                `${ expect }` +
                                `${ forLoopCloses }`

                            its += '' +
                                `${ I( 1 + 1 + 1 ) }it( 'return type is ${ lowerName } when ${ itDeclaration.join( ' and ' ) }', () => {` + '\n' +
                                '\n' +
                                `${ param }` +
                                '\n' +
                                `${ I( 1 + 1 + 1 ) }} )` + '\n'

                        } else {

                            let itDeclaration = []
                            let index         = 0
                            let indent        = 1 + 1 + 1 + 1
                            let localIndent   = indent
                            let dataSets      = ''
                            let forLoopOpens  = ''
                            let forLoopCloses = ''
                            let args          = []
                            for ( let parameter of parameters ) {

                                const parameterType = parameter.types[ 0 ]
                                itDeclaration.push( `${ parameter.name } is of type ${ parameterType }` )

                                dataSets += `${ I( indent ) }const dataSet${ index } = this._dataMap[ '${ parameterType }s' ]` + '\n'
                                forLoopOpens += '' + '\n' +
                                    `${ I( localIndent ) }for ( let key${ index } in dataSet${ index } ) {` + '\n' +
                                    `${ I( localIndent + 1 ) }const dataSetValue${ index } = dataSet${ index }[ key${ index } ]` + '\n'

                                args.push( `dataSetValue${ index }` )

                                forLoopCloses = `${ I( localIndent ) }}` + '\n' + `${ forLoopCloses }`

                                index++
                                localIndent++
                            }

                            const result = `${ I( localIndent ) }const result = ${ nsName }.${ docData.name }( ${ args.join( ', ' ) } )` + '\n'

                            let returnTypesLabel = []
                            let expects          = []
                            for ( let returnType of returns ) {

                                const lowerName = returnType.toLowerCase()
                                returnTypesLabel.push( lowerName )

                                if ( lowerName.startsWith( 'array' ) ) {
                                    expects.push( `expect(result).to.be.a('array')` )
                                    //todo array of...
                                } else {
                                    expects.push( `expect(result).to.be.a('${ lowerName }')` )
                                }

                            }
                            let openTry  = ''
                            let closeTry = ''
                            for ( let expect of expects ) {
                                openTry += '' +
                                    `${ I( localIndent ) }try {` + '\n' +
                                    `${ I( localIndent + 1 ) }${ expect }` + '\n' +
                                    `${ I( localIndent ) }} catch(e) {` + '\n'

                                closeTry = `${ I( localIndent ) }}` + '\n' + `${ closeTry }`

                                localIndent++
                            }
                            const _expect = '' +
                                `${ openTry }` +
                                `${ I( localIndent ) }expect.fail("expect result to be of type ${ returnTypesLabel.join( ' or ' ) }")` + '\n' +
                                `${ closeTry }`

                            const param = '' +
                                `${ dataSets }` +
                                `${ forLoopOpens }` +
                                `${ result }` +
                                `${ _expect }` +
                                `${ forLoopCloses }`

                            its += '' +
                                `${ I( 1 + 1 + 1 ) }it( 'return type is ${ returnTypesLabel.join( ' or ' ) } when ${ itDeclaration.join( ' and ' ) }', () => {` + '\n' +
                                '\n' +
                                `${ param }` +
                                '\n' +
                                `${ I( 1 + 1 + 1 ) }} )` + '\n'

                        }

                    }

                    describes += '' +
                        `${ I.__ }describe( '${ docData.name }()', () => {` + '\n' +
                        '\n' +
                        `${ I.___ }it( 'is bundlable', () => {` + '\n' +
                        '\n' +
                        `${ I.____ }expect(${ nsName }.${ docData.name }).to.exist` + '\n' +
                        '\n' +
                        `${ I.___ }} )` + '\n' +
                        '\n' +
                        `${ its }` +
                        '\n' +
                        `${ I.__ }} )` + '\n' +
                        '\n'

                } catch ( error ) {

                    log( red( error.message ) )

                }

            }

            const template = '' +
                `import { expect }       from 'chai'` + '\n' +
                `import { beforeEach, afterEach, describe, it } from 'mocha'` + '\n' +
                `import { Testing }      from 'itee-utils'` + '\n' +
                `import * as ${ nsName } from '${ importFilePath }'` + '\n' +
                '\n' +
                `function ${ unitName } () {` + '\n' +
                '\n' +
                `${ I( 1 ) }beforeEach( () => {` + '\n' +
                '\n' +
                `${ I( 1 + 1 ) }this._dataMap = Testing.createDataMap()` + '\n' +
                '\n' +
                `${ I( 1 ) }} )` + '\n' +
                '\n' +
                `${ I( 1 ) }afterEach( () => {` + '\n' +
                '\n' +
                `${ I( 1 + 1 ) }delete this._dataMap` + '\n' +
                '\n' +
                `${ I( 1 ) }} )` + '\n' +
                '\n' +
                `${ I( 1 ) }describe( '${ unitName }', () => {` + '\n' +
                '\n' +
                `${ describes }` +
                '' +
                `${ I( 1 ) }} )` + '\n' +
                '\n' +
                '}' + '\n' +
                '\n' +
                `export { ${ unitName } }` + '\n' +
                '\n'

            const importUnitFilePath = path.relative( unitsDir, unitFilePath )
            unitsImportMap.push( {
                exportName: unitName,
                path:       importUnitFilePath.replace( /\\/g, '/' )
            } )

            log( green( `Create ${ unitFilePath }` ) )
            fs.mkdirSync( unitDirPath, { recursive: true } )
            fs.writeFileSync( unitFilePath, template )

        } catch ( error ) {

            log( red( error.message ) )

        }

    }

    // Global units file
    let computedImports   = ''
    let computedUnitCalls = ''
    for ( let entry of unitsImportMap ) {
        computedImports += `import { ${ entry.exportName } }   from './${ entry.path }'` + '\n'
        computedUnitCalls += `    ${ entry.exportName }.call( root )` + '\n'
    }

    const unitsTemplate = '' +
        'import { describe }      from \'mocha\'' + '\n' +
        `${ computedImports }` +
        '\n' +
        'const root = typeof window === \'undefined\'' + '\n' +
        '    ? typeof global === \'undefined\'' + '\n' +
        '        ? Function( \'return this\' )() ' + '\n' +
        '        : global ' + '\n' +
        '    : window' + '\n' +
        '\n' +
        'describe( \'Itee#Validators\', () => {' + '\n' +
        '\n' +
        `${ computedUnitCalls }` +
        '\n' +
        '} )' + '\n'

    const unitsFilePath = path.join( unitsDir, `${ packageInfos.name }.units.js` )

    log( green( `Create ${ unitsFilePath }` ) )
    fs.writeFileSync( unitsFilePath, unitsTemplate )

    done()

} )
/**
 * @description Will generate unit test bundles based on provided configs
 */
gulp.task( 'bundle-unit-tests', async ( done ) => {

    const configs = rollupUnitTestsConfigurator()

    for ( let config of configs ) {

        log( `Building ${ config.output.file }` )

        try {

            const bundle = await rollup( config )
            await bundle.write( config.output )

        } catch ( error ) {

            log( red( error ) )

        }

    }

    done()

} )
/**
 * @description Will compte and generate bundle for unit tests
 */
gulp.task( 'build-unit-tests', gulp.series( 'compute-unit-tests', 'bundle-unit-tests' ) )

/**
 * @description Will generate benchmarks files from source code against provided alternatives
 */
gulp.task( 'compute-benchmarks', async ( done ) => {

    const basePath   = __dirname
    const sourcesDir = path.join( basePath, 'sources' )
    const testsDir   = path.join( basePath, 'tests' )
    const benchsDir  = path.join( testsDir, 'benchmarks' )

    fs.mkdirSync( benchsDir, { recursive: true } )

    const filePathsToIgnore = getGulpConfigForTask( 'compute-benchmarks' )

    const sourcesFiles = glob.sync( path.join( sourcesDir, '**' ) )
                             .map( filePath => path.normalize( filePath ) )
                             .filter( filePath => {
                                 const fileName         = path.basename( filePath )
                                 const isJsFile         = fileName.endsWith( '.js' )
                                 const isNotPrivateFile = !fileName.startsWith( '_' )
                                 const isNotIgnoredFile = !filePathsToIgnore.includes( fileName )
                                 return isJsFile && isNotPrivateFile && isNotIgnoredFile
                             } )

    const benchRootImports = []
    for ( let sourceFile of sourcesFiles ) {

        const specificFilePath = sourceFile.replace( sourcesDir, '' )
        const specificDir      = path.dirname( specificFilePath )

        const fileName      = path.basename( sourceFile, path.extname( sourceFile ) )
        const benchFileName = `${ fileName }.bench.js`
        const benchDirPath  = path.join( benchsDir, specificDir )
        const benchFilePath = path.join( benchDirPath, benchFileName )

        const nsName         = `${ fileName }Namespace`
        const importDirPath  = path.relative( benchDirPath, sourcesDir )
        const importFilePath = path.join( importDirPath, specificFilePath ).replace( /\\/g, '/' )

        try {

            const jsdocPath   = path.join( basePath, '/node_modules/jsdoc/jsdoc.js' )
            const jsdocOutput = childProcess.execFileSync( 'node', [ jsdocPath, '-X', sourceFile ] ).toString()

            const classNames    = []
            const usedLongnames = []
            const jsonData      = JSON.parse( jsdocOutput ).filter( data => {

                const longName = data.longname

                const kind = data.kind
                if ( kind !== 'function' ) {
                    if ( kind === 'class' && !classNames.includes( longName ) ) {
                        classNames.push( longName )
                    }
                    return false
                }

                const undocumented = data.undocumented
                if ( undocumented ) {
                    return false
                }

                const scope = data.scope
                if ( ![ 'global', 'static' ].includes( scope ) ) {
                    return false
                }

                if ( longName.includes( ' ' ) || longName.includes( '~' ) || usedLongnames.includes( longName ) ) {
                    return false
                }

                for ( let className of classNames ) {
                    if ( longName.includes( className ) ) {
                        return false
                    }
                }

                usedLongnames.push( longName )

                return true

            } )

            if ( jsonData.length === 0 ) {
                log( yellow( `No usable exports found in [${ sourceFile }]. Ignore it !` ) )
                continue
            }

            // Compute benchmark suites by grouping logically function by name[_x]
            const suiteGroups = {}
            for ( let docData of jsonData ) {

                try {

                    const functionName = docData.name
                    const nameSplits   = functionName.split( '_' )
                    const rootName     = nameSplits[ 0 ]

                    if ( !( rootName in suiteGroups ) ) {
                        suiteGroups[ rootName ] = []
                    }

                    suiteGroups[ rootName ].push( functionName )

                } catch ( error ) {

                    log( red( error.message ) )

                }

            }

            // Generate suites
            let benchSuites       = ''
            const suitesToExports = []
            for ( let suiteGroupName in suiteGroups ) {
                suitesToExports.push( `${ suiteGroupName }Suite` )
                benchSuites += `const ${ suiteGroupName }Suite = Benchmark.Suite( '${ nsName }.${ suiteGroupName }', Testing.createSuiteOptions() )` + '\n'

                for ( let suiteGroupValue of suiteGroups[ suiteGroupName ] ) {
                    benchSuites += `                                     .add( '${ suiteGroupValue }()', Testing.iterateOverDataMap( ${ nsName }.${ suiteGroupValue } ), Testing.createBenchmarkOptions() )` + '\n'
                }

                benchSuites += '\n'
            }

            const template = '' + '\n' +
                `import Benchmark   from 'benchmark'` + '\n' +
                `import { Testing }      from 'itee-utils'` + '\n' +
                `import * as ${ nsName } from '${ importFilePath }'` + '\n' +
                '\n' +
                `${ benchSuites }` +
                // '\n' +
                `export { ${ suitesToExports } }` + '\n' +
                '\n'

            const importBenchFilePath = path.relative( benchsDir, benchFilePath ).replace( /\\/g, '/' )
            benchRootImports.push( {
                path:    importBenchFilePath,
                exports: suitesToExports
            } )

            log( green( `Create ${ benchFilePath }` ) )
            fs.mkdirSync( benchDirPath, { recursive: true } )
            fs.writeFileSync( benchFilePath, template )

        } catch ( error ) {

            log( red( error.message ) )

        }

    }

    let templateImports = ''
    let suites          = []
    for ( let i = 0 ; i < benchRootImports.length ; i++ ) {

        const currentBench = benchRootImports[ i ]
        const exports      = currentBench.exports
        const imports      = exports.join( ', ' )
        suites.push( ...exports )

        templateImports += `import {${ imports }} from './${ currentBench.path }'` + '\n'

    }

    const benchsTemplate = '' +
        `${ templateImports }` + '\n' +
        'const suites = [' + '\n' +
        `${ suites.map( suite => `\t${ suite }` ).join( ',\n' ) }` + '\n' +
        ']' + '\n' +
        '\n' +
        `for ( const suite of suites ) {` + '\n' +
        `\tsuite.run()` + '\n' +
        `}` + '\n'

    const benchsFilePath = path.join( benchsDir, `${ packageInfos.name }.benchs.js` )

    log( green( `Create ${ benchsFilePath }` ) )
    fs.writeFileSync( benchsFilePath, benchsTemplate )

    done()

} )
/**
 * @description Will generate benchmarks bundles based on provided configs
 */
gulp.task( 'bundle-benchmarks', async ( done ) => {

    const configs = rollupBenchesConfigurator()

    for ( let config of configs ) {

        log( `Building ${ config.output.file }` )

        try {

            const bundle = await rollup( config )
            await bundle.write( config.output )

        } catch ( error ) {

            log( red( error ) )

        }

    }

    done()

} )
/**
 * @description Will compte and generate bundle for benchmarks
 */
gulp.task( 'build-benchmarks', gulp.series( 'compute-benchmarks', 'bundle-benchmarks' ) )

/**
 * @method npm run build-test
 * @global
 * @description Will build all tests.
 */
gulp.task( 'build-tests', gulp.series( 'check-bundling', 'build-unit-tests', 'build-benchmarks' ) )

//---------

/**
 * @description Will run unit tests with node
 */
gulp.task( 'run-unit-tests-for-node', ( done ) => {

    const mochaPath = path.join( __dirname, 'node_modules/mocha/bin/mocha' )
    const testsPath = path.join( __dirname, `tests/units/builds/${ packageInfos.name }.units.cjs.js` )
    const mocha     = childProcess.spawn( 'node', [ mochaPath, testsPath ], { stdio: 'inherit' } )
    mocha.on( 'close', ( code ) => {

        ( code === 0 )
        ? done()
        : done( `mocha exited with code ${ code }` )

    } )

} )
/**
 * @description Will run unit tests with karma
 */
gulp.task( 'run-unit-tests-for-browser', async ( done ) => {

    const configFile  = path.normalize( `${ __dirname }/configs/karma.units.conf.js` )
    const karmaConfig = karma.config.parseConfig( configFile )
    const karmaServer = new karma.Server( karmaConfig, ( exitCode ) => {
        if ( exitCode === 0 ) {
            log( `Karma server exit with code ${ exitCode }` )
            done()
        } else {
            done( `Karma server exit with code ${ exitCode }` )
        }
    } )
    karmaServer.on( 'browser_error', ( browser, error ) => {
        log( red( error.message ) )
    } )

    await karmaServer.start()

} )
/**
 * @description Will run unit tests in back and front environments
 */
gulp.task( 'run-unit-tests', gulp.series( 'run-unit-tests-for-node'/*, 'run-unit-tests-for-browser'*/ ) )

/**
 * @description Will run benchmarks with node
 */
gulp.task( 'run-benchmarks-for-node', ( done ) => {

    const benchsPath = path.join( __dirname, `tests/benchmarks/builds/${ packageInfos.name }.benchs.cjs.js` )
    const benchmark  = childProcess.spawn( 'node', [ benchsPath ], { stdio: 'inherit' } )
    benchmark.on( 'close', ( code ) => {

        ( code === 0 )
        ? done()
        : done( `benchmark exited with code ${ code }` )

    } )

} )
/**
 * @description Will run benchmarks with karma
 */
gulp.task( 'run-benchmarks-for-browser', async ( done ) => {

    const configFile  = path.normalize( `${ __dirname }/configs/karma.benchs.conf.js` )
    const karmaConfig = karma.config.parseConfig( configFile )
    const karmaServer = new karma.Server( karmaConfig, ( exitCode ) => {
        if ( exitCode === 0 ) {
            log( `Karma server exit with code ${ exitCode }` )
            done()
        } else {
            done( `Karma server exit with code ${ exitCode }` )
        }
    } )
    karmaServer.on( 'browser_error', ( browser, error ) => {
        log( red( error.message ) )
    } )

    await karmaServer.start()

} )
/**
 * @description Will run benchmarks in back and front environments
 */
gulp.task( 'run-benchmarks', gulp.series( 'run-benchmarks-for-node'/*, 'run-benchmarks-for-browser'*/ ) )

/**
 * @method npm run test
 * @global
 * @description Will run unit tests and benchmarks for node (backend) and karma (frontend) environments
 */
gulp.task( 'test', gulp.series( 'run-unit-tests', 'run-benchmarks' ) )

//---------

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
            i: path.join( __dirname, 'sources', `${ packageInfos.name }.js` ),
            o: path.join( __dirname, 'builds' ),
            f: ['esm','cjs'],
            e: ['dev','prod'],
            s: true,
            t: true
        },
        alias:   {
            i: 'input',
            o: 'output',
            f: 'formats',
            e: 'envs',
            s: 'sourcemap',
            t: 'treeshake'
        }
    } )

    const configs = rollupConfigurator( options )

    nextBuild()

    function nextBuild( error ) {
        'use strict'

        if ( error ) {

            done( error )

        } else if ( configs.length === 0 ) {

            done()

        } else {

            const config = configs.pop()
            log( `Building ${ config.output.file }` )

            rollup( config )
                .then( ( bundle ) => { return bundle.write( config.output ) } )
                .then( () => { nextBuild() } )
                .catch( nextBuild )

        }

    }

} )

//---------

/**
 * @method npm run release
 * @global
 * @description Will perform a complet release of the library including 'clean', 'lint', 'doc', 'build-tests', 'test' and finally 'build'.
 */
gulp.task( 'release', gulp.series( 'clean', 'lint', 'doc', 'build-tests', 'test', 'build' ) )

//---------

gulp.task( 'default', gulp.series( 'help' ) )
