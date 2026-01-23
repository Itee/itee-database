import { join }                        from 'node:path'
import { iteePackageSourcesDirectory } from '@itee/tasks'

export default [
    join( iteePackageSourcesDirectory, 'tests/units/run-unit-tests-for-backend.task.mjs' )
]
