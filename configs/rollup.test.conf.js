/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Config-Rollup-Test
 * @description The file manage the rollup configuration for build tests
 */

const packageInfos = require( '../package' )

/**
 * Will create an appropriate configuration object for rollup, related to the given arguments.
 *
 * @generator
 * @return {Array.<json>} An array of rollup configuration
 */
function CreateTestsRollupConfigs ( /*options*/ ) {
    'use strict'

    return [
        {
            input:     `tests/units/units.js`,
            plugins:   [],
            treeshake: true,
            output:    {
                indent: '\t',
                format: 'iife',
                name:   'Itee.Units',
                file:   `tests/builds/${packageInfos.name}.units.js`
            }
        },
        {
            input:     `tests/benchmarks/benchs.js`,
            plugins:   [],
            treeshake: true,
            output:    {
                indent: '\t',
                format: 'iife',
                name:   'Itee.Benchs',
                file:   `tests/builds/${packageInfos.name}.benchs.js`
            }
        }
    ]

}

module.exports = CreateTestsRollupConfigs
