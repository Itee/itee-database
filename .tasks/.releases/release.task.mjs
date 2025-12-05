import colors                    from 'ansi-colors'
import log                       from 'fancy-log'
import { series }                from 'gulp'
import { relative }              from 'path'
import { buildTask }             from '../.builds/build.task.mjs'
import { cleanTask }             from '../.cleans/clean.task.mjs'
import { docTask }               from '../.docs/doc.task.mjs'
import { lintTask }              from '../.lints/lint.task.mjs'
import { computeBenchmarksTask } from '../.tests/benchmarks/compute-benchmarks.task.mjs'
import { runTestsTask }         from '../.tests/run-tests.task.mjs'
import { computeUnitTestsTask } from '../.tests/units/compute-unit-tests.task.mjs'
import { packageRootDirectory } from '../_utils.mjs'

const {
          green,
          blue
      } = colors

/**
 * @method npm run release
 * @global
 * @description Will perform a complete release of the library including 'clean', 'lint', 'doc', 'build-tests', 'test' and finally 'build'.
 */
const releaseTask       = series(
    cleanTask,
    buildTask,
    computeBenchmarksTask,
    computeUnitTestsTask,
    runTestsTask,
    lintTask,
    docTask,
)
releaseTask.displayName = 'release'
releaseTask.description = 'Will perform a complete release of the library including \'clean\', \'lint\', \'doc\', \'test\' and finally \'build\'.'
releaseTask.flags       = null

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( releaseTask.displayName ) }` )

export { releaseTask }