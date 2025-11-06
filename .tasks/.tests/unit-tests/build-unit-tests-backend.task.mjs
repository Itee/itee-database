import colors                                    from 'ansi-colors'
import log                                       from 'fancy-log'
import { rollup }                                from 'rollup'
import { buildUnitTestsBackendConfig as config } from '../../configs/build-unit-tests-backend.conf.mjs'

const {
          red,
          green
      } = colors

/**
 * @description Will generate unit test bundles based on provided configs
 */
const buildUnitTestsBackendTask       = async ( done ) => {

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
buildUnitTestsBackendTask.displayName = 'build-unit-tests-backend'
buildUnitTestsBackendTask.description = 'Will generate unit test bundles based on provided configs'
buildUnitTestsBackendTask.flags       = null

export { buildUnitTestsBackendTask }
