/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Building
 *
 * @description The gulp tasks file. It allow to run some tasks from command line interface.<br>
 * The available tasks are:
 * <ul>
 * <li>help</li>
 * <li>patch</li>
 * <li>clean</li>
 * <li>lint</li>
 * <li>doc</li>
 * <li>unit</li>
 * <li>bench</li>
 * <li>test</li>
 * <li>build-test</li>
 * <li>build</li>
 * <li>release</li>
 * </ul>
 * You could find a complet explanation about these tasks using: <b>npm run help</b>.
 *
 * @requires {@link module: [gulp]{@link https://github.com/gulpjs/gulp}}
 * @requires {@link module: [gulp-jsdoc3]{@link https://github.com/mlucool/gulp-jsdoc3}}
 * @requires {@link module: [gulp-eslint]{@link https://github.com/adametry/gulp-eslint}}
 * @requires {@link module: [del]{@link https://github.com/sindresorhus/del}}
 * @requires {@link module: [rollup]{@link https://github.com/rollup/rollup}}
 * @requires {@link module: [path]{@link https://nodejs.org/api/path.html}}
 * @requires {@link module: [karma]{@link https://github.com/karma-runner/karma}}
 * @requires {@link module: [fancy-log]{@link https://github.com/js-cli/fancy-log}}
 * @requires {@link module: [ansi-colors]{@link https://github.com/doowb/ansi-colors}}
 *
 *
 */

import gulp                                    from 'gulp'
import { helpTask }                            from './.tasks/.helps/help.task.mjs'
import { patchTask }                           from './.tasks/.patches/patch.task.mjs'
import { cleanTask }                           from './.tasks/.cleans/clean.task.mjs'
import { lintTask }                            from './.tasks/.lints/lint.task.mjs'
import { docTask }                             from './.tasks/.docs/doc.task.mjs'
import { checkBundlingFromEsmFilesImportTask } from './.tasks/.tests/bundling/check-bundling-from-esm-files-import.task.mjs'
import { checkBundlingFromEsmBuildImportTask } from './.tasks/.tests/bundling/check-bundling-from-esm-build-import.task.mjs'
import { checkBundlingFromEsmFilesDirectTask } from './.tasks/.tests/bundling/check-bundling-from-esm-files-direct.task.mjs'
import { computeUnitTestsTask }                from './.tasks/.tests/unit-tests/compute-unit-tests.task.mjs'
import { bundleUnitTestsTask }                 from './.tasks/.tests/unit-tests/bundle-unit-tests.task.mjs'
import { runUnitTestsForFrontendTask }         from './.tasks/.tests/unit-tests/run-unit-tests-for-frontend.task.mjs'
import { runUnitTestsForBackendTask }          from './.tasks/.tests/unit-tests/run-unit-tests-for-backend.task.mjs'
import { bundleBenchmarksTask }                from './.tasks/.tests/benchmarks/bundle-benchmarks.task.mjs'
import { computeBenchmarksTask }               from './.tasks/.tests/benchmarks/compute-benchmarks.task.mjs'
import { runBenchmarksForBackendTask }         from './.tasks/.tests/benchmarks/run-benchmarks-for-backend.task.mjs'
import { runBenchmarksForFrontendTask }        from './.tasks/.tests/benchmarks/run-benchmarks-for-frontend.task.mjs'
import { buildTask }                           from './.tasks/.builds/build.task.mjs'

//---------

/**
 * @method npm run help ( default )
 * @global
 * @description Will display the help in console
 */
gulp.task( 'help', helpTask )

/**
 * @method npm run patch
 * @global
 * @description Will apply some patch/replacements in dependencies
 */
gulp.task( 'patch', patchTask )

/**
 * @method npm run clean
 * @global
 * @description Will delete builds and temporary folders
 */
gulp.task( 'clean', cleanTask )

/**
 * @method npm run lint
 * @global
 * @description Will lint the sources files and try to fix the style when possible
 */
gulp.task( 'lint', lintTask )

/**
 * @method npm run doc
 * @global
 * @description Will generate this documentation
 */
gulp.task( 'doc', docTask )


//---------

/**
 * @description In view to detect bundling side effects this task will
 * create intermediary file for each individual export from this package
 * and then create rollup config for each of them and bundle
 * Todo: Check for differents target env like next task below this one
 */
gulp.task( 'check-bundling-from-esm-files-import', checkBundlingFromEsmFilesImportTask )
gulp.task( 'check-bundling-from-esm-build-import', checkBundlingFromEsmBuildImportTask )
gulp.task( 'check-bundling-from-esm-files-direct', checkBundlingFromEsmFilesDirectTask )
gulp.task( 'check-bundling', gulp.series( 'check-bundling-from-esm-files-import', 'check-bundling-from-esm-build-import', 'check-bundling-from-esm-files-direct' ) )

/**
 * @description Will generate unit test files from source code using type inference from comments
 */
gulp.task( 'compute-unit-tests', computeUnitTestsTask )
/**
 * @description Will generate unit test bundles based on provided configs
 */
gulp.task( 'bundle-unit-tests', bundleUnitTestsTask )
/**
 * @description Will compte and generate bundle for unit tests
 */
gulp.task( 'build-unit-tests', gulp.series( 'compute-unit-tests', 'bundle-unit-tests' ) )

/**
 * @description Will generate benchmarks files from source code against provided alternatives
 */
gulp.task( 'compute-benchmarks', computeBenchmarksTask )
/**
 * @description Will generate benchmarks bundles based on provided configs
 */
gulp.task( 'bundle-benchmarks', bundleBenchmarksTask )
/**
 * @description Will compte and generate bundle for benchmarks
 */
gulp.task( 'build-benchmarks', gulp.series( 'compute-benchmarks', 'bundle-benchmarks' ) )

/**
 * @method npm run build-test
 * @global
 * @description Will build all tests.
 */
gulp.task( 'build-tests', gulp.series( 'check-bundling', 'build-unit-tests', 'build-benchmarks' ) )

//---------

/**
 * @description Will run unit tests with node
 */
gulp.task( 'run-unit-tests-for-backend', runUnitTestsForBackendTask )
/**
 * @description Will run unit tests with karma
 */
gulp.task( 'run-unit-tests-for-frontend', runUnitTestsForFrontendTask )
/**
 * @description Will run unit tests in back and front environments
 */
gulp.task( 'run-unit-tests', gulp.series( 'run-unit-tests-for-backend'/*, 'run-unit-tests-for-frontend'*/ ) )

/**
 * @description Will run benchmarks with node
 */
gulp.task( 'run-benchmarks-for-backend', runBenchmarksForBackendTask )
/**
 * @description Will run benchmarks with karma
 */
gulp.task( 'run-benchmarks-for-frontend', runBenchmarksForFrontendTask )
/**
 * @description Will run benchmarks in back and front environments
 */
gulp.task( 'run-benchmarks', gulp.series( 'run-benchmarks-for-backend'/*, 'run-benchmarks-for-frontend'*/ ) )

/**
 * @method npm run test
 * @global
 * @description Will run unit tests and benchmarks for node (backend) and karma (frontend) environments
 */
gulp.task( 'test', gulp.series( 'run-unit-tests', 'run-benchmarks' ) )

//---------

/**
 * @method npm run build
 * @global
 * @description Will build itee client module using optional arguments. See help to further informations.
 */
gulp.task( 'build', buildTask )

//---------

/**
 * @method npm run release
 * @global
 * @description Will perform a complete release of the library including 'clean', 'lint', 'doc', 'build-tests', 'test' and finally 'build'.
 */
gulp.task( 'release', gulp.series( 'clean', 'build', 'build-tests', 'lint', 'doc', 'test' ) )

//---------

gulp.task( 'default', gulp.series( 'help' ) )
