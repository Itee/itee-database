import { series }                     from 'gulp'
import { buildBenchmarksBackendTask } from './build-benchmarks-backend.task.mjs'
import { computeBenchmarksTask }      from './compute-benchmarks.task.mjs'

/**
 * @description Will compute and generate bundle for benchmarks
 */
const buildBenchmarksTask       = series(
    computeBenchmarksTask,
    buildBenchmarksBackendTask,
)
buildBenchmarksTask.displayName = 'build-benchmarks'
buildBenchmarksTask.description = 'Will compute and generate bundle for benchmarks.'
buildBenchmarksTask.flags       = null

export { buildBenchmarksTask }