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
function CreateUnitsRollupConfigs ( /*options*/ ) {
    'use strict'

    return [
        // For node
        {
            input:    `tests/units/${packageInfos.name}.units.js`,
            external: [
                'mocha',
                'chai',
                'express'
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
                name:   'Itee.Units',
                file:   `tests/units/builds/${packageInfos.name}.units.cjs.js`
            }
        },
        // For karma
        // {
        //     input:     `tests/units/${packageInfos.name}.units.js`,
        //     external:  [ 'chai', 'mocha' ],
        //     plugins:   [],
        //     treeshake: true,
        //     output:    {
        //         indent:  '\t',
        //         format:  'iife',
        //         name:    'Itee.Units',
        //         globals: {
        //             'chai':  'chai',
        //             'mocha': 'mocha'
        //         },
        //         file: `tests/units/builds/${packageInfos.name}.units.iife.js`
        //     }
        // },
    ]

}

module.exports = CreateUnitsRollupConfigs
