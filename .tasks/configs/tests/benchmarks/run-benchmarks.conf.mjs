import { join }                 from 'path'
import { iteePackageSourcesDirectory } from '@itee/tasks'

export default [
    join( iteePackageSourcesDirectory, 'tests/benchmarks/run-benchmarks-for-backend.task.mjs' )
]