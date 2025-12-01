import { startTestRunner }      from '@web/test-runner'
import colors                   from 'ansi-colors'
import log                      from 'fancy-log'
import { relative }             from 'path'
import { packageRootDirectory } from '../../_utils.mjs'
import { default as config }    from '../../configs/units.conf.mjs'

const {
          red,
          green,
          blue
      } = colors

/**
 * @description Will run unit tests with web-test-runner
 */
const runUnitTestsForFrontendTask       = () => {
    return new Promise( async ( resolve, reject ) => {

        const testRunner = await startTestRunner( {
            config:          config,
            readCliArgs:     false,
            readFileConfig:  false,
            autoExitProcess: false,
        } )

        if ( !testRunner ) {
            reject( red( 'Internal test runner error.' ) )
            return
        }

        // To ensure that testRunner exit event won't be used by other instance of test runner,
        // we need to be sure that current test runner is ended
        testRunner.on( 'finished', () => {
            testRunner.stop()
        } )

        testRunner.on( 'stopped', () => {
            resolve()
        } )

    } )
}
runUnitTestsForFrontendTask.displayName = 'run-unit-tests-for-frontend'
runUnitTestsForFrontendTask.description = 'Will run unit tests with web-test-runner'
runUnitTestsForFrontendTask.flags       = null

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( runUnitTestsForFrontendTask.displayName ) }` )

export { runUnitTestsForFrontendTask }