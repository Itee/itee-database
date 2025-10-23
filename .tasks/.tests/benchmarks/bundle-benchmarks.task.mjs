import colors                        from 'ansi-colors'
import log                           from 'fancy-log'
import { rollup }                    from 'rollup'
import { getRollupConfigurationFor } from '../../configs/build.conf.mjs'

const {
          red,
          green,
          yellow
      } = colors

async function bundleBenchmarksTask( done ) {

    const configs = [
        getRollupConfigurationFor( 'benchmarks-backend' ),
        getRollupConfigurationFor( 'benchmarks-frontend' )
    ]

    for ( let config of configs ) {

        if ( config === undefined || config === null || config.length === 0 ) {
            log( yellow( 'Empty configuration object... Skip it!' ) )
            continue
        }

        log( 'Building', green( config.output.file ) )

        try {

            const bundle = await rollup( config )
            await bundle.write( config.output )

        } catch ( error ) {

            done( red( error.message ) )
            return

        }

    }

    done()

}

export { bundleBenchmarksTask }