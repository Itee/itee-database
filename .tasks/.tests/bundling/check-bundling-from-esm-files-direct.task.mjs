import {
    join,
    normalize,
    basename,
    extname,
    dirname,
    relative
}                               from 'path'
import {
    existsSync,
    rmSync,
    mkdirSync,
    writeFileSync
}                               from 'fs'
import glob                     from 'glob'
import { nodeResolve }          from '@rollup/plugin-node-resolve'
import cleanup                  from 'rollup-plugin-cleanup'
import { rollup }               from 'rollup'
import { getGulpConfigForTask } from '../../../configs/gulp.conf.mjs'
import {
    packageSourcesDirectory as sourcesDir,
    packageTestsBundlesDirectory as bundlesDir
}                               from '../../_utils.mjs'
import log                      from 'fancy-log'
import colors                   from 'ansi-colors'

const {
          red,
          green,
          blue,
          cyan,
          yellow,
          magenta
      } = colors

async function checkBundlingFromEsmFilesDirectTask( done ) {

    const outputDir         = join( bundlesDir, 'from_files_direct' )
    const filePathsToIgnore = getGulpConfigForTask( 'check-bundling' )

    if ( existsSync( outputDir ) ) {
        log( 'Clean up', magenta( outputDir ) )
        rmSync( outputDir, { recursive: true } )
    }

    const sourcesFiles = glob.sync( join( sourcesDir, '**' ) )
                             .map( filePath => normalize( filePath ) )
                             .filter( filePath => {
                                 const fileName         = basename( filePath )
                                 const isJsFile         = fileName.endsWith( '.js' )
                                 const isNotPrivateFile = !fileName.startsWith( '_' )
                                 const isNotIgnoredFile = !filePathsToIgnore.includes( fileName )
                                 return isJsFile && isNotPrivateFile && isNotIgnoredFile
                             } )

    for ( let sourceFile of sourcesFiles ) {

        const specificFilePath = sourceFile.replace( sourcesDir, '' )
        const specificDir      = dirname( specificFilePath )
        const fileName         = basename( sourceFile, extname( sourceFile ) )

        const bundleFileName = `${ fileName }.bundle.js`
        const bundleFilePath = join( outputDir, specificDir, bundleFileName )

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

            log( `Bundling ${ config.output.file }` )

            const bundle = await rollup( config )
            await bundle.generate( config.output )
            await bundle.write( config.output )

        } catch ( error ) {

            log( red( error.message ) )

        }

    }

    done()

}

export { checkBundlingFromEsmFilesDirectTask }