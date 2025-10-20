import { rollup }               from 'rollup'
import log                      from 'fancy-log'
import { getGulpConfigForTask } from '../../configs/gulp.conf.mjs'
import { CreateRollupConfigs }  from '../../configs/rollup.conf.mjs'
import colors                   from 'ansi-colors'

const red   = colors.red
const green = colors.green

async function build( done ) {

    const options = getGulpConfigForTask( 'builds' )
    const configs = CreateRollupConfigs( options )

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

export { build }