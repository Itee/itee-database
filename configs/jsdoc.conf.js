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
            'excludePattern': '(node_modules|docs|builds|tests)'
        },
        'sourceType': 'module',
        'plugins':    [
            //            "./jsdoc-plugins/shout"
        ],
        'recurseDepth': 2,
        'opts':         {
            'encoding':    'utf8',
            'destination': './docs/',
            'recurse':     true,
            'verbose':     true,
            'private':     true,
            'tutorials':   './tutorials/'
        },
        'templates': {
            'default': {
                'staticFiles': {
                    'include': [ './tutorials/resources/' ]
                },
                'useLongnameInNav': false
            },
            'cleverLinks':    true,
            'monospaceLinks': false,

            'includeDate': false,
            'navType':     'inline',
            'theme':       [
                                     'cerulean',
                                     'cosmo',
                                     'darkly',
                                     'cyborg',
                                     'flatly',
                                     'journal',
                                     'lumen',
                                     'paper',
                                     'readable',
                                     'sandstone',
                                     'simplex',
                                     'slate',
                                     'spacelab',
                                     'superhero',
                                     'united',
                                     'yeti'
                                 ][ 3 ],
            'syntaxTheme':       'dark',
            'linenums':          true,
            'collapseSymbols':   true,
            'outputSourceFiles': true,
            'sort':              'longname, version, since',
            'search':            true
        }
    }

}

module.exports = CreateJsdocConfiguration()
