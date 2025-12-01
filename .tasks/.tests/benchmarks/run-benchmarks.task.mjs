import colors                                  from 'ansi-colors'
import log                                     from 'fancy-log'
import { relative }                            from 'path'
import {
    packageRootDirectory,
    serializeTasksFrom
}                                              from '../../_utils.mjs'
import { runBenchmarksTaskFiles as taskFiles } from '../../configs/run-benchmarks.conf.mjs'

const {
          green,
          blue
      } = colors

const runBenchmarksTestsTask       = await serializeTasksFrom( taskFiles )
runBenchmarksTestsTask.displayName = 'run-benchmarks'
runBenchmarksTestsTask.description = 'Will run benchmarks in back and front environments.'
runBenchmarksTestsTask.flags       = null

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( runBenchmarksTestsTask.displayName ) }` )

export { runBenchmarksTestsTask }