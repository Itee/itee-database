import colors                   from 'ansi-colors'
import log                      from 'fancy-log'
import { existsSync }           from 'fs'
import karma                    from 'karma'
import path                     from 'path'
import { packageRootDirectory } from '../../_utils.mjs'

const {
          red,
          yellow
      } = colors


async function runBenchmarksForFrontendTask( done ) {

    const configFile = path.normalize( `${ packageRootDirectory }/configs/karma.benchs.conf.js` )
    if ( !existsSync( configFile ) ) {
        log( yellow( `${ configFile } does not exist, skip frontend benchmarks...` ) )
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

export { runBenchmarksForFrontendTask }