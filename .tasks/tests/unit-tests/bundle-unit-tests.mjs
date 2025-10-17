import rollupUnitTestsConfigurator from '../../../configs/rollup.units.conf.js'
import log                         from 'fancy-log'
import { rollup }                  from 'rollup'
import colors                      from 'ansi-colors'

const red = colors.red

async function bundleUnitTests( done ) {

    const configs = rollupUnitTestsConfigurator()

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

export { bundleUnitTests }