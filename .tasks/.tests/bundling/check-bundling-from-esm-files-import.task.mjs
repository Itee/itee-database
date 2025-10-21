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
import {
    packageSourcesDirectory as sourcesDir,
    packageTestsBundlesDirectory as bundleDir
}                               from '../../_utils.mjs'
import { sourcesFiles }              from '../../configs/check-bundling.conf.mjs'
import { getRollupConfigurationFor } from '../../configs/build.conf.mjs'

const {
          red,
          green,
          blue,
          cyan,
          yellow,
          magenta
      } = colors

async function checkBundlingFromEsmFilesImportTask( done ) {

    const outputDir         = join( bundleDir, 'from_files_import' )
    const temporariesDir    = join( outputDir, '.tmp' )

    if ( existsSync( outputDir ) ) {
        log( 'Clean up', magenta( outputDir ) )
        rmSync( outputDir, { recursive: true } )
    }

    const config = getRollupConfigurationFor( 'check-bundling-from-esm-files-import' )
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

        config.input       = temporaryFile
        config.output.file = bundleFilePath

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

export { checkBundlingFromEsmFilesImportTask }