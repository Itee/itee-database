import { serializeTasksFrom }                 from '../../_utils.mjs'
import { runBenchmarksTaskFiles as taskFiles } from '../../configs/run-benchmarks.conf.mjs'

const runBenchmarksTestsTask       = await serializeTasksFrom( taskFiles )
runBenchmarksTestsTask.displayName = 'run-benchmarks'
runBenchmarksTestsTask.description = 'Will run benchmarks in back and front environments.'
runBenchmarksTestsTask.flags       = null

export { runBenchmarksTestsTask }