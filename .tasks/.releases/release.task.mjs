import { series }         from 'gulp'
import { buildTask }      from '../.builds/build.task.mjs'
import { cleanTask }      from '../.cleans/clean.task.mjs'
import { docTask }        from '../.docs/doc.task.mjs'
import { lintTask }       from '../.lints/lint.task.mjs'
import { buildTestsTask } from '../.tests/build-tests.task.mjs'
import { runTestsTask }   from '../.tests/run-tests.task.mjs'

const releaseTask       = series(
    cleanTask,
    buildTask,
    buildTestsTask,
    lintTask,
    runTestsTask,
    docTask,
)
releaseTask.displayName = 'release'
releaseTask.description = 'Will perform a complete release of the library including \'clean\', \'lint\', \'doc\', \'build-tests\', \'test\' and finally \'build\'.'
releaseTask.flags       = null

/**
 * @method npm run release
 * @global
 * @description Will perform a complete release of the library including 'clean', 'lint', 'doc', 'build-tests', 'test' and finally 'build'.
 */
export { releaseTask }