/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module configs/JsDoc
 * @description The configuration file of the jsdoc plugin
 */

/**
 * Will create an appropriate configuration object for jsdoc
 *
 * @generator
 * @returns {object} The jsdoc configuration
 */
function CreateJsdocConfiguration() {

    return {
        tags:         {
            allowUnknownTags: false,
            dictionaries:     [ 'jsdoc', 'closure' ]
        },
        source:       {
            include:        [ 'README.md' ],
            includePattern: '.+\\.(js|mjs|jsx)?$',
            excludePattern: '(node_modules|docs|builds)',
            exclude:        []
        },
        sourceType:   'module',
        plugins:      [],
        recurseDepth: 5,
        opts:         {
            template:    './node_modules/ink-docstrap/template',
            access:      'all',
            debug:       false,
            encoding:    'utf8',
            destination: 'docs',
            recurse:     true,
            verbose:     true,
            private:     true
        },
        templates:    {
            cleverLinks:       false,
            monospaceLinks:    false,
            navType:           'inline',
            theme:             [
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
            syntaxTheme:       'dark',
            linenums:          true,
            collapseSymbols:   false,
            sort:              'longname, version, since',
            search:            true,
            systemName:        'Itee-Validators',
            footer:            '',
            copyright:         'Copyright 2015-Present <a href="https://github.com/Itee">Itee</a> (Tristan Valcke)',
            includeDate:       false,
            inverseNav:        false,
            outputSourceFiles: true,
            outputSourcePath:  true
        }
    }

}

module.exports = CreateJsdocConfiguration()
