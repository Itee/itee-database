import {
    join,
    normalize,
    basename,
    parse,
    dirname,
    relative
}                      from 'path'
import {
    existsSync,
    rmSync,
    mkdirSync,
    writeFileSync,
    readFileSync
}                      from 'fs'
import log             from 'fancy-log'
import { rollup }      from 'rollup'
import colors          from 'ansi-colors'
import {
    packageBuildsDirectory as buildsDir,
    packageTestsBundlesDirectory as bundlesDir,
    packageName
}                      from '../../_utils.mjs'
import { getRollupConfigurationFor } from '../../configs/build.conf.mjs'


const {
          red,
          green,
          magenta
      } = colors

async function checkBundlingFromEsmBuildImportTask( done ) {

    const buildFilePath = join( buildsDir, `${ packageName }.esm.js` )
    if ( !existsSync( buildFilePath ) ) {
        done( red( buildFilePath + ' does not exist' ) )
    }

    const outputDir      = join( bundlesDir, 'from_build_import' )
    const temporaryDir   = join( bundlesDir, 'from_build_import', '.tmp' )
    const importDir      = relative( temporaryDir, buildsDir )
    const importFilePath = join( importDir, `${ packageName }.esm.js` )

    if ( existsSync( outputDir ) ) {
        log( 'Clean up', magenta( outputDir ) )
        rmSync( outputDir, { recursive: true } )
    }

    try {

        // Get build exports list
        const data  = readFileSync( buildFilePath, 'utf8' )
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
            const temporaryFilePath = join( temporaryDir, temporaryFileName )
            const temporaryFileData = `import { ${ namedExport } } from '${ importFilePath.replace( /\\/g, '/' ) }'`

            mkdirSync( temporaryDir, { recursive: true } )
            writeFileSync( temporaryFilePath, temporaryFileData )

            temporaryFilePaths.push( temporaryFilePath )
        }

        // Bundle each temporary files and check side effects
        const config = getRollupConfigurationFor('check-bundling-from-esm-build-import')
        let fileName, bundleFileName, bundleFilePath
        for ( const temporaryFilePath of temporaryFilePaths ) {

            fileName       = basename( temporaryFilePath )
            bundleFileName = fileName.replace( '.tmp.', '.bundle.' )
            bundleFilePath = join( outputDir, bundleFileName )

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

}

export { checkBundlingFromEsmBuildImportTask }