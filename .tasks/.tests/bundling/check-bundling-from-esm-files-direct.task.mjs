import colors                        from 'ansi-colors'
import log                           from 'fancy-log'
import {
    existsSync,
    rmSync
}                                    from 'fs'
import {
    basename,
    dirname,
    extname,
    join
}                                    from 'path'
import { rollup }                    from 'rollup'
import {
    packageSourcesDirectory as sourcesDir,
    packageTestsBundlesDirectory as bundlesDir
}                                    from '../../_utils.mjs'
import { getRollupConfigurationFor } from '../../configs/build.conf.mjs'
import { sourcesFiles }              from '../../configs/check-bundling.conf.mjs'

const {
          red,
          green,
          magenta
      } = colors

async function checkBundlingFromEsmFilesDirectTask( done ) {

    const outputDir = join( bundlesDir, 'from_files_direct' )
    if ( existsSync( outputDir ) ) {
        log( 'Clean up', magenta( outputDir ) )
        rmSync( outputDir, { recursive: true } )
    }

    const config = getRollupConfigurationFor( 'check-bundling-from-esm-files-direct' )
    for ( let sourceFile of sourcesFiles ) {

        const specificFilePath = sourceFile.replace( sourcesDir, '' )
        const specificDir      = dirname( specificFilePath )
        const fileName         = basename( sourceFile, extname( sourceFile ) )

        const bundleFileName = `${ fileName }.bundle.js`
        const bundleFilePath = join( outputDir, specificDir, bundleFileName )

        config.input       = sourceFile
        config.output.file = bundleFilePath

        try {

            log( 'Bundling', green( config.output.file ) )

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