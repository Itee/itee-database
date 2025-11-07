/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module configs/Rollup
 * @description The file manage the rollup configuration for build the library using differents arguments. It allow to build with two type of environment (dev and prod), and differents output format.
 * Use npm run help to display all available build options.
 *
 * @requires {@link module: [rollup-plugin-commonjs]{@link https://github.com/rollup/rollup-plugin-commonjs}}
 * @requires {@link module: [path]{@link https://nodejs.org/api/path.html}}
 * @requires {@link module: [rollup-plugin-re]{@link https://github.com/jetiny/rollup-plugin-re}}
 * @requires {@link module: [rollup-plugin-node-resolve]{@link https://github.com/rollup/rollup-plugin-node-resolve}}
 * @requires {@link module: [rollup-plugin-terser]{@link https://github.com/TrySound/rollup-plugin-terser}}
 */
import nodeResolve     from '@rollup/plugin-node-resolve'
import cleanup         from 'rollup-plugin-cleanup'
import { packageName } from '../_utils.mjs'

const buildBenchmarksBackendConfig = {
    input:     `tests/benchmarks/${ packageName }.benchmarks.js`,
    external:  [
        'benchmark',
        'express',
        'http',
        'https',
        'fs',
        'path',
        'crypto'
    ],
    plugins:   [
        nodeResolve( {
            preferBuiltins: true
        } ),
        cleanup( {
            comments: 'none'
        } )
    ],
    treeshake: true,
    output:    {
        indent: '\t',
        format: 'cjs',
        intro:  () => 'var Benchmark = require(\'benchmark\')',
        file:   `tests/benchmarks/builds/${ packageName }.benchmarks.cjs.js`
    }
}

export { buildBenchmarksBackendConfig }
