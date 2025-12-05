import colors         from 'ansi-colors'
import { spawn }      from 'child_process'
import log            from 'fancy-log'
import { existsSync } from 'fs'
import {
    join,
    relative
}                     from 'path'
import {
    nodeModulesDirectory,
    packageName,
    packageRootDirectory,
    packageTestsUnitsDirectory
}                     from '../../_utils.mjs'

const {
          red,
          green,
          blue,
          yellow,
      } = colors

/**
 * @description Will run unit tests with node
 */
const runUnitTestsForBackendTask       = ( done ) => {

    const testsPath = join( packageTestsUnitsDirectory, `/${ packageName }.units.mjs` )
    if ( !existsSync( testsPath ) ) {
        log( yellow( `${ testsPath } does not exist, skip backend unit tests...` ) )
        done()
        return
    }

    const mochaPath = join( nodeModulesDirectory, '/mocha/bin/mocha' )
    const mocha     = spawn( 'node', [ mochaPath, testsPath ], { stdio: 'inherit' } )
    mocha.on( 'close', ( code ) => {

        ( code === 0 )
        ? done()
        : done( red( `mocha exited with code ${ code }` ) )

    } )

}
runUnitTestsForBackendTask.displayName = 'run-unit-tests-for-backend'
runUnitTestsForBackendTask.description = 'Will run unit tests with node'
runUnitTestsForBackendTask.flags       = null

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( runUnitTestsForBackendTask.displayName ) }` )

export { runUnitTestsForBackendTask }