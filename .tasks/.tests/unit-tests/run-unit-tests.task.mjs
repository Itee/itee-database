import { series }                      from 'gulp'
import { runUnitTestsForBackendTask }  from './run-unit-tests-for-backend.task.mjs'
import { runUnitTestsForFrontendTask } from './run-unit-tests-for-frontend.task.mjs'

/**
 * @method npm run build-test
 * @global
 * @description Will run unit tests in back and front environments
 */
const runUnitTestsTask       = series(
    runUnitTestsForBackendTask,
    runUnitTestsForFrontendTask,
)
runUnitTestsTask.displayName = 'run-unit-tests'
runUnitTestsTask.description = 'Will run unit tests in back and front environments.'
runUnitTestsTask.flags       = null

export { runUnitTestsTask }