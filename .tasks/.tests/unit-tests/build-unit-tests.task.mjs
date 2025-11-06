import { series }                    from 'gulp'
import { buildUnitTestsBackendTask } from './build-unit-tests-backend.task.mjs'
import { computeUnitTestsTask }      from './compute-unit-tests.task.mjs'

/**
 * @description Will compute and generate bundle for unit tests
 */
const buildUnitTestsTask       = series(
    computeUnitTestsTask,
    buildUnitTestsBackendTask,
)
buildUnitTestsTask.displayName = 'build-unit-tests'
buildUnitTestsTask.description = 'Will compute and generate bundle for unit tests.'
buildUnitTestsTask.flags       = null

export { buildUnitTestsTask }