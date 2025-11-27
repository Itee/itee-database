import { join }                 from 'path'
import { packageRootDirectory } from '../_utils.mjs'

const runBenchmarksTaskFiles = [
    join( packageRootDirectory, '.tasks/.tests/benchmarks/run-benchmarks-for-backend.task.mjs' ),
    // join( packageRootDirectory, '.tasks/.tests/benchmarks/run-benchmarks-for-frontend.task.mjs' )
]

export { runBenchmarksTaskFiles }