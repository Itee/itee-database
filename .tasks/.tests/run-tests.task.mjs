import colors                     from 'ansi-colors'
import log                        from 'fancy-log'
import { series }                 from 'gulp'
import { relative }               from 'path'
import { packageRootDirectory }   from '../_utils.mjs'
import { runBenchmarksTestsTask } from './benchmarks/run-benchmarks.task.mjs'
import { runUnitTestsTask }       from './unit-tests/run-unit-tests.task.mjs'

const {
          green,
          blue
      } = colors

/**
 * @method npm run test
 * @global
 * @description Will run unit tests and benchmarks for backend (node) and frontend (web-test-runner) environments
 */
const runTestsTask       = series(
    runBenchmarksTestsTask,
    runUnitTestsTask,
)
runTestsTask.displayName = 'run-tests'
runTestsTask.description = 'Will run unit tests and benchmarks for backend (node) and frontend (web-test-runner) environments.'
runTestsTask.flags       = null

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( runTestsTask.displayName ) }` )

export { runTestsTask }