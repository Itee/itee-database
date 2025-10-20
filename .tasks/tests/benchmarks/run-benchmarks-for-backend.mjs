import path from 'path'
import childProcess from 'child_process'
import {
    packageTestsBenchmarksDirectory,
    packageName
} from '../../_utils.mjs'


function runBenchmarksForBackend( done ) {

    const benchesPath = path.join( packageTestsBenchmarksDirectory, `/builds/${ packageName }.benchs.cjs.js` )
    const benchmark   = childProcess.spawn( 'node', [ benchesPath ], { stdio: 'inherit' } )
    benchmark.on( 'close', ( code ) => {

        ( code === 0 )
        ? done()
        : done( `benchmark exited with code ${ code }` )

    } )

}

export { runBenchmarksForBackend }