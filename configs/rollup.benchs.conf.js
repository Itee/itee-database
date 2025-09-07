/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module configs/Rollup-Test
 * @description The file manage the rollup configuration for build tests
 */

const packageInfos = require( '../package' )
const {nodeResolve} = require('@rollup/plugin-node-resolve')

/**
 * Will create an appropriate configuration object for rollup, related to the given arguments.
 *
 * @generator
 * @return {Array.<json>} An array of rollup configuration
 */
function CreateBenchmarksRollupConfigs ( /*options*/ ) {
    'use strict'

    return [
        // For Node
        {
            input:    `tests/benchmarks/${packageInfos.name}.benchs.js`,
            external: [
                'benchmark',
                'express',
                'http',
                'https',
                'fs',
                'path',
                'crypto'
            ],
            plugins: [
                nodeResolve( {
                    preferBuiltins: true
                } )
            ],
            treeshake: true,
            output:    {
                indent: '\t',
                format: 'cjs',
                name:   'Itee.Benchs',
                file:   `tests/benchmarks/builds/${packageInfos.name}.benchs.cjs.js`
            }
        },
        // For Karma
        // {
        //     input:     `tests/benchmarks/${packageInfos.name}.benchs.js`,
        //     plugins:   [],
        //     treeshake: true,
        //     output:    {
        //         indent: '\t',
        //         format: 'iife',
        //         name:   'Itee.Benchs',
        //         file:   `tests/benchmarks/builds/${packageInfos.name}.benchs.iife.js`
        //     }
        // },
    ]

}

module.exports = CreateBenchmarksRollupConfigs
