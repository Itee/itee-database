import { existsSync }           from 'fs'
import { normalize }            from 'path'
import karma                    from 'karma'
import log                      from 'fancy-log'
import colors                   from 'ansi-colors'
import { packageRootDirectory } from '../../_utils.mjs'

const {
          red,
          yellow
      } = colors


async function runUnitTestsForFrontendTask( done ) {

    const configFile = normalize( `${ packageRootDirectory }/configs/karma.units.conf.js` )
    if ( !existsSync( configFile ) ) {
        log( yellow( `${ configFile } does not exist, skip frontend unit tests...` ) )
        done()
        return
    }

    const karmaConfig = karma.config.parseConfig( configFile )
    const karmaServer = new karma.Server( karmaConfig, ( exitCode ) => {
        if ( exitCode === 0 ) {
            log( `Karma server exit with code ${ exitCode }` )
            done()
        } else {
            done( `Karma server exit with code ${ exitCode }` )
        }
    } )
    karmaServer.on( 'browser_error', ( browser, error ) => {
        log( red( error.message ) )
    } )

    await karmaServer.start()

}

export { runUnitTestsForFrontendTask }