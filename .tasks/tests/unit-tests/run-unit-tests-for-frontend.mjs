import { normalize }   from 'path'
import karma  from 'karma'
import log    from 'fancy-log'
import colors from 'ansi-colors'
import {
    getDirname,
    packageInfos
}             from '../../_utils.mjs'

const {
          red,
          green,
          blue,
          cyan,
          yellow,
          magenta
      } = colors


async function runUnitTestsForFrontend( done ) {

    const projectDir  = getDirname()
    const configFile  = normalize( `${ projectDir }/configs/karma.units.conf.js` )
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

export { runUnitTestsForFrontend }