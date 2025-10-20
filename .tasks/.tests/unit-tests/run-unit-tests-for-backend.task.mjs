import { join }  from 'path'
import { spawn } from 'child_process'
import {
    nodeModulesDirectory,
    packageTestsUnitsDirectory,
    packageName
}                from '../../_utils.mjs'


function runUnitTestsForBackendTask( done ) {

    const mochaPath = join( nodeModulesDirectory, '/mocha/bin/mocha' )
    const testsPath = join( packageTestsUnitsDirectory, `/builds/${ packageName }.units.cjs.js` )
    const mocha     = spawn( 'node', [ mochaPath, testsPath ], { stdio: 'inherit' } )
    mocha.on( 'close', ( code ) => {

        ( code === 0 )
        ? done()
        : done( `mocha exited with code ${ code }` )

    } )

}

export { runUnitTestsForBackendTask }