import path from 'path'
import childProcess from 'child_process'
import {
    getDirname,
    packageInfos
} from '../../_utils.mjs'


function runBenchmarksForBackend( done ) {

    const projectDir = getDirname()
    const benchsPath = path.join( projectDir, `tests/benchmarks/builds/${ packageInfos.name }.benchs.cjs.js` )
    const benchmark  = childProcess.spawn( 'node', [ benchsPath ], { stdio: 'inherit' } )
    benchmark.on( 'close', ( code ) => {

        ( code === 0 )
        ? done()
        : done( `benchmark exited with code ${ code }` )

    } )

}

export { runBenchmarksForBackend }