/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module Config-JsDoc
 * @description The configuration file of the jsdoc plugin
 */

/**
 * Will create an appropriate configuration object for jsdoc
 *
 * @generator
 * @returns {object} The jsdoc configuration
 */
function CreateJsdocConfiguration () {

    return {
        'tags': {
            'allowUnknownTags': false,
            'dictionaries':     [ 'jsdoc', 'closure' ]
        },
        'source': {
            'include':        [ 'README.md' ],
            'includePattern': '.+\\.js(doc|x)?$',
            'excludePattern': '(node_modules|documentation|builds|tests)'
        },
        'sourceType':   'module',
        'plugins':      [],
        'recurseDepth': 2,
        'opts':         {
            'encoding':    'utf8',
            'destination': './documentation/API/',
            'recurse':     true,
            'verbose':     true,
            'private':     true
        }
    }

}

module.exports = CreateJsdocConfiguration()
