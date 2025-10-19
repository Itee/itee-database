import { join } from 'path'
import { spawn } from 'child_process'
import {
    getDirname,
    packageInfos
} from '../../_utils.mjs'


function runUnitTestsForBackend( done ) {

    const projectDir = getDirname()
    const mochaPath  = join( projectDir, 'node_modules/mocha/bin/mocha' )
    const testsPath  = join( projectDir, `tests/units/builds/${ packageInfos.name }.units.cjs.js` )
    const mocha      = spawn( 'node', [ mochaPath, testsPath ], { stdio: 'inherit' } )
    mocha.on( 'close', ( code ) => {

        ( code === 0 )
        ? done()
        : done( `mocha exited with code ${ code }` )

    } )

}

export { runUnitTestsForBackend }