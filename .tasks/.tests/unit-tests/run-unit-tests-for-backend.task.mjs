import colors         from 'ansi-colors'
import { spawn }      from 'child_process'
import log            from 'fancy-log'
import { existsSync } from 'fs'
import { join }       from 'path'
import {
    nodeModulesDirectory,
    packageName,
    packageTestsUnitsDirectory
}                     from '../../_utils.mjs'

const {
          red,
          yellow,
      } = colors

function runUnitTestsForBackendTask( done ) {

    const testsPath = join( packageTestsUnitsDirectory, `/builds/${ packageName }.units.cjs.js` )
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

export { runUnitTestsForBackendTask }