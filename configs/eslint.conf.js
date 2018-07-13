/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module config/eslintConfiguration
 * @description The configuration file of the eslint plugin
 *
 */

/**
 * Will create an appropriate configuration object for eslint
 *
 * @returns {object} The eslint configuration
 */
function CreateEslintConfiguration () {

    return {
        env:           {
            "browser": true,
            "node":    true,
            "es6":     true
        },
        parserOptions: {
            ecmaVersion: 6,
            sourceType:  "module"
        },
        extends:       [ 'eslint:recommended' ],
        plugins:       [
            "mocha"
        ],
        rules:         {
            'mocha/no-exclusive-tests': 'error',
            'no-console':               'off',
        }
    }

}

module.exports = CreateEslintConfiguration()
