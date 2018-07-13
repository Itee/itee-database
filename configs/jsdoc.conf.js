/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [MIT]{@link https://opensource.org/licenses/MIT}
 *
 * @module config/jsdocConfiguration
 *
 * @description The configuration file of the jsdoc plugin
 *
 */

/* eslint-env node */

/**
 * Will create an appropriate configuration object for jsdoc
 *
 * @returns {object} The jsdoc configuration
 */
function CreateJsdocConfiguration () {

    return {
        "tags":         {
            "allowUnknownTags": false,
            "dictionaries":     [ "jsdoc", "closure" ]
        },
        "source":       {
            "include":        [ "README.md" ],
            "includePattern": ".js$",
            "excludePattern": "(node_modules|documentation|builds)"
        },
        //        "sourceType":   "module",
        "plugins":      [],
        "recurseDepth": 5,
        "opts":         {
            "template":    "node_modules/docdash/",
            "encoding":    "utf8",
            "destination": "./documentation/",
            "recurse":     true,
            "verbose":     true,
            "private":     true
        },
        "templates":    {
            "cleverLinks":    false,
            "monospaceLinks": false,
            "default":        {
                "includeDate": false
            }
        }
    }

}

module.exports = CreateJsdocConfiguration()
