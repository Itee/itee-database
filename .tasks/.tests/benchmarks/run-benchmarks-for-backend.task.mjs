import colors         from 'ansi-colors'
import log            from 'fancy-log'
import { existsSync } from 'fs'
import {
    join,
    relative
}                     from 'path'
import {
    packageName,
    packageRootDirectory,
    packageTestsBenchmarksDirectory
}                     from '../../_utils.mjs'

const {
          red,
          green,
          blue,
          yellow
      } = colors

/**
 * @description Will run benchmarks with node
 */
const runBenchmarksForBackendTask       = async ( done ) => {

    const benchesPath = join( packageTestsBenchmarksDirectory, `/${ packageName }.benchmarks.js` )
    if ( !existsSync( benchesPath ) ) {
        log( yellow( `${ benchesPath } does not exist, skip backend benchmarks...` ) )
        done()
        return
    }

    try {
        await import(benchesPath)
        done()
    } catch ( error ) {
        done( red( error ) )
    }

}
runBenchmarksForBackendTask.displayName = 'run-benchmarks-for-backend'
runBenchmarksForBackendTask.description = 'Will run benchmarks with node'
runBenchmarksForBackendTask.flags       = null

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( runBenchmarksForBackendTask.displayName ) }` )

export { runBenchmarksForBackendTask }