import { getRollupConfigurationFor } from '../../../configs/rollup.conf.mjs'
import log                           from 'fancy-log'
import { rollup }                    from 'rollup'
import colors                        from 'ansi-colors'

const red = colors.red
const green = colors.green

async function bundleUnitTestsTask( done ) {

    const configs = [
        getRollupConfigurationFor( 'units-backend' ),
        getRollupConfigurationFor( 'units-frontend' )
    ]

    let buildError = null

    for ( let config of configs ) {

        log( 'Building', green( config.output.file ) )

        try {

            const bundle = await rollup( config )
            await bundle.write( config.output )

        } catch ( error ) {

            log( red( error ) )
            buildError = error
            break

        }

    }

    done( buildError )

}

export { bundleUnitTestsTask }