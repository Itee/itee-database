import { join }                 from 'path'
import { packageRootDirectory } from '../_utils.mjs'

const runUnitTestsTaskFiles = [
    join( packageRootDirectory, '.tasks/.tests/unit-tests/run-unit-tests-for-backend.task.mjs' ),
    // join( packageRootDirectory, '.tasks/.tests/unit-tests/run-unit-tests-for-frontend.task.mjs' )
]

export { runUnitTestsTaskFiles }