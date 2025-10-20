import { getRollupConfigurationFor } from '../../../configs/rollup.conf.mjs'
import log                           from 'fancy-log'
import { rollup }                    from 'rollup'
import colors                        from 'ansi-colors'

const red = colors.red

async function bundleBenchmarks( done ) {

    const configs = [
        getRollupConfigurationFor( 'benchmarks-backend' ),
        getRollupConfigurationFor( 'benchmarks-frontend' )
    ]

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

}

export { bundleBenchmarks }