import colors                                     from 'ansi-colors'
import log                                        from 'fancy-log'
import { rollup }                                 from 'rollup'
import { buildBenchmarksBackendConfig as config } from '../../configs/build-benchmarks-backend.conf.mjs'

const {
          red,
          green
      } = colors

/**
 * @description Will generate benchmarks bundles based on provided configs
 */
const buildBenchmarksBackendTask       = async ( done ) => {

    if ( config === undefined || config === null || config.length === 0 ) {
        done( red( 'Empty configuration!' ) )
        return
    }

    log( 'Building', green( config.output.file ) )

    try {

        const bundle = await rollup( config )
        await bundle.write( config.output )

    } catch ( error ) {

        done( red( error.message ) )
        return

    }

    done()

}
buildBenchmarksBackendTask.displayName = 'build-benchmarks-backend'
buildBenchmarksBackendTask.description = 'Will apply some patch/replacements in dependencies'
buildBenchmarksBackendTask.flags       = null

export { buildBenchmarksBackendTask }