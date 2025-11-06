import { series }                      from 'gulp'
import { runBenchmarksForBackendTask }  from './run-benchmarks-for-backend.task.mjs'
import { runBenchmarksForFrontendTask } from './run-benchmarks-for-frontend.task.mjs'

/**
 * @method npm run build-test
 * @global
 * @description Will run benchmarks in back and front environments
 */
const runBenchmarksTestsTask       = series(
    runBenchmarksForBackendTask,
    runBenchmarksForFrontendTask,
)
runBenchmarksTestsTask.displayName = 'run-benchmarks'
runBenchmarksTestsTask.description = 'Will run benchmarks in back and front environments.'
runBenchmarksTestsTask.flags       = null

export { runBenchmarksTestsTask }