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
 * @requires {@link module: [minimist]{@link https://github.com/substack/minimist}}
 * @requires {@link module: [rollup]{@link https://github.com/rollup/rollup}}
 * @requires {@link module: [path]{@link https://nodejs.org/api/path.html}}
 * @requires {@link module: [karma]{@link https://github.com/karma-runner/karma}}
 * @requires {@link module: [fancy-log]{@link https://github.com/js-cli/fancy-log}}
 * @requires {@link module: [ansi-colors]{@link https://github.com/doowb/ansi-colors}}
 *
 *
 */

import gulp                                from 'gulp'
import { help }                            from './.tasks/helps/help.mjs'
import { patch }                           from './.tasks/patches/patch.mjs'
import { clean }                           from './.tasks/cleans/clean.mjs'
import { lint }                            from './.tasks/lints/lint.mjs'
import { doc }                             from './.tasks/docs/doc.mjs'
import { checkBundlingFromEsmFilesImport } from './.tasks/tests/bundling/check-bundling-from-esm-files-import.mjs'
import { checkBundlingFromEsmBuildImport } from './.tasks/tests/bundling/check-bundling-from-esm-build-import.mjs'
import { checkBundlingFromEsmFilesDirect } from './.tasks/tests/bundling/check-bundling-from-esm-files-direct.mjs'
import { computeUnitTests }                from './.tasks/tests/unit-tests/compute-unit-tests.mjs'
import { bundleUnitTests }                 from './.tasks/tests/unit-tests/bundle-unit-tests.mjs'
import { runUnitTestsForFrontend }         from './.tasks/tests/unit-tests/run-unit-tests-for-frontend.mjs'
import { runUnitTestsForBackend }          from './.tasks/tests/unit-tests/run-unit-tests-for-backend.mjs'
import { bundleBenchmarks }                from './.tasks/tests/benchmarks/bundle-benchmarks.mjs'
import { computeBenchmarks }               from './.tasks/tests/benchmarks/compute-benchmarks.mjs'
import { runBenchmarksForBackend }         from './.tasks/tests/benchmarks/run-benchmarks-for-backend.mjs'
import { runBenchmarksForFrontend }        from './.tasks/tests/benchmarks/run-benchmarks-for-frontend.mjs'
import { build }        from './.tasks/builds/build.mjs'

//---------

/**
 * @method npm run help ( default )
 * @global
 * @description Will display the help in console
 */
gulp.task( 'help', help )

/**
 * @method npm run patch
 * @global
 * @description Will apply some patch/replacements in dependencies
 */
gulp.task( 'patch', patch )

/**
 * @method npm run clean
 * @global
 * @description Will delete builds and temporary folders
 */
gulp.task( 'clean', clean )

/**
 * @method npm run lint
 * @global
 * @description Will lint the sources files and try to fix the style when possible
 */
gulp.task( 'lint', lint )

/**
 * @method npm run doc
 * @global
 * @description Will generate this documentation
 */
gulp.task( 'doc', doc )


//---------

/**
 * @description In view to detect bundling side effects this task will
 * create intermediary file for each individual export from this package
 * and then create rollup config for each of them and bundle
 * Todo: Check for differents target env like next task below this one
 */
gulp.task( 'check-bundling-from-esm-files-import', checkBundlingFromEsmFilesImport )
gulp.task( 'check-bundling-from-esm-build-import', checkBundlingFromEsmBuildImport )
gulp.task( 'check-bundling-from-esm-files-direct', checkBundlingFromEsmFilesDirect )
gulp.task( 'check-bundling', gulp.series( 'check-bundling-from-esm-files-import', 'check-bundling-from-esm-build-import', 'check-bundling-from-esm-files-direct' ) )

/**
 * @description Will generate unit test files from source code using type inference from comments
 */
gulp.task( 'compute-unit-tests', computeUnitTests )
/**
 * @description Will generate unit test bundles based on provided configs
 */
gulp.task( 'bundle-unit-tests', bundleUnitTests )
/**
 * @description Will compte and generate bundle for unit tests
 */
gulp.task( 'build-unit-tests', gulp.series( 'compute-unit-tests', 'bundle-unit-tests' ) )

/**
 * @description Will generate benchmarks files from source code against provided alternatives
 */
gulp.task( 'compute-benchmarks', computeBenchmarks )
/**
 * @description Will generate benchmarks bundles based on provided configs
 */
gulp.task( 'bundle-benchmarks', bundleBenchmarks )
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
gulp.task( 'run-unit-tests-for-backend', runUnitTestsForBackend )
/**
 * @description Will run unit tests with karma
 */
gulp.task( 'run-unit-tests-for-frontend', runUnitTestsForFrontend )
/**
 * @description Will run unit tests in back and front environments
 */
gulp.task( 'run-unit-tests', gulp.series( 'run-unit-tests-for-backend'/*, 'run-unit-tests-for-frontend'*/ ) )

/**
 * @description Will run benchmarks with node
 */
gulp.task( 'run-benchmarks-for-backend', runBenchmarksForBackend )
/**
 * @description Will run benchmarks with karma
 */
gulp.task( 'run-benchmarks-for-frontend', runBenchmarksForFrontend )
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
gulp.task( 'build', build )

//---------

/**
 * @method npm run release
 * @global
 * @description Will perform a complet release of the library including 'clean', 'lint', 'doc', 'build-tests', 'test' and finally 'build'.
 */
gulp.task( 'release', gulp.series( 'clean', 'lint', 'doc', 'build', 'build-tests', 'test' ) )

//---------

gulp.task( 'default', gulp.series( 'help' ) )
