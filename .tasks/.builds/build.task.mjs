import colors                        from 'ansi-colors'
import log                           from 'fancy-log'
import { relative }                  from 'path'
import { rollup }                    from 'rollup'
import { packageRootDirectory }      from '../_utils.mjs'
import { getRollupConfigurationFor } from '../configs/build.conf.mjs'

const {
          red,
          green,
          blue,
          yellow
      } = colors

const buildTask       = async ( done ) => {

    const configs = getRollupConfigurationFor( 'build' )

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
buildTask.displayName = 'build'
buildTask.description = 'Todo...'
buildTask.flags       = null

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( buildTask.displayName ) }` )

export { buildTask }
