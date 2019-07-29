/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module config/babelConfiguration
 *
 * @description The configuration file of the babel plugin
 *
 * @example Todo
 *
 */

/**
 * Will create an appropriate configuration object for babel.
 *
 * @returns {object} The babel configuration
 */
function CreateBabelConfiguration ( onProduction ) {

    return {
        exclude: 'node_modules/**',
        presets: [
            [
                "@babel/preset-env",
                {
                    modules: false
                }
            ]
        ],
        plugins: [
            [
                "babel-plugin-transform-builtin-extend",
                {
                    globals: [ "Error" ]
                }
            ]
        ],
        compact: onProduction
    }

}

module.exports = CreateBabelConfiguration
