import { serializeTasksFrom }                 from '../../_utils.mjs'
import { runUnitTestsTaskFiles as taskFiles } from '../../configs/run-unit-tests.conf.mjs'

const runUnitTestsTask       = await serializeTasksFrom( taskFiles )
runUnitTestsTask.displayName = 'run-unit-tests'
runUnitTestsTask.description = 'Will run unit tests in back and front environments.'
runUnitTestsTask.flags       = null

export { runUnitTestsTask }