import colors         from 'ansi-colors'
import childProcess   from 'child_process'
import log            from 'fancy-log'
import { existsSync } from 'fs'
import path           from 'path'
import {
    packageName,
    packageTestsBenchmarksDirectory
}                     from '../../_utils.mjs'

const yellow = colors.yellow

function runBenchmarksForBackendTask( done ) {

    const benchesPath = path.join( packageTestsBenchmarksDirectory, `/builds/${ packageName }.benchs.cjs.js` )
    if ( !existsSync( benchesPath ) ) {
        log( yellow( `${ benchesPath } does not exist, skip backend benchmarks...` ) )
        done()
        return
    }

    const benchmark = childProcess.spawn( 'node', [ benchesPath ], { stdio: 'inherit' } )
    benchmark.on( 'close', ( code ) => {

        ( code === 0 )
        ? done()
        : done( `benchmark exited with code ${ code }` )

    } )

}

export { runBenchmarksForBackendTask }