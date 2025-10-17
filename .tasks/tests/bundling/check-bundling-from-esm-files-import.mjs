import {
    join,
    normalize,
    basename,
    parse,
    dirname,
    relative
}                               from 'path'
import {
    existsSync,
    rmSync,
    mkdirSync,
    writeFileSync
}                               from 'fs'
import log                      from 'fancy-log'
import glob                     from 'glob'
import { nodeResolve }          from '@rollup/plugin-node-resolve'
import cleanup                  from 'rollup-plugin-cleanup'
import { rollup }               from 'rollup'
import colors                   from 'ansi-colors'
import { getGulpConfigForTask } from '../../../configs/gulp.conf.mjs'
import { getDirname }           from '../../_utils.mjs'

const {
          red,
          green,
          blue,
          cyan,
          yellow,
          magenta
      } = colors

async function checkBundlingFromEsmFilesImport( done ) {

    const baseDir           = getDirname()
    const sourcesDir        = join( baseDir, 'sources' )
    const testsDir          = join( baseDir, 'tests' )
    const bundleDir         = join( testsDir, 'bundles' )
    const outputDir         = join( bundleDir, 'from_files_import' )
    const temporariesDir    = join( outputDir, '.tmp' )
    const filePathsToIgnore = getGulpConfigForTask( 'check-bundling' )

    if ( existsSync( outputDir ) ) {
        log( 'Clean up', magenta( outputDir ) )
        rmSync( outputDir, { recursive: true } )
    }

    const sourcesFiles = glob.sync( join( sourcesDir, '/**' ) )
                             .map( filePath => {
                                 return normalize( filePath )
                             } )
                             .filter( filePath => {
                                 const fileName         = basename( filePath )
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
              }                = parse( sourceFile )
        const specificFilePath = sourceFile.replace( sourcesDir, '' )
        const specificDir      = dirname( specificFilePath )

        // Create temp import file per file in package
        const temporaryFileName = `${ sourceName }.import.js`
        const temporaryDir      = join( temporariesDir, specificDir )
        const temporaryFile     = join( temporaryDir, temporaryFileName )
        const importDir         = relative( temporaryDir, sourceDir )
        const importFile        = join( importDir, sourceBase )
        const temporaryFileData = `import '${ importFile.replace( /\\/g, '/' ) }'`

        // Bundle tmp file and check content for side effects
        const bundleFileName = `${ sourceName }.bundle.js`
        const bundleFilePath = join( outputDir, specificDir, bundleFileName )

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

            mkdirSync( temporaryDir, { recursive: true } )
            writeFileSync( temporaryFile, temporaryFileData )

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

}

export { checkBundlingFromEsmFilesImport }