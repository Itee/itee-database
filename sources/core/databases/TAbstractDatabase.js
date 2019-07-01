/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const path                    = require( 'path' )
const TAbstractDatabasePlugin = require( '../plugins/TAbstractDatabasePlugin' )

class TAbstractDatabase {

    constructor ( driver, application, router, plugins = [], autoReconnectTimeout = 10000 ) {

        this._driver               = driver
        this._application          = application
        this._router               = router
        this._plugins              = plugins
        this._autoReconnectTimeout = autoReconnectTimeout
        this._autoConnectionTimer  = null

        this._initDatabase()
        this._registerPlugins()

    }

    _initDatabase () {}

    _registerPlugins () {

        // Register modules plugins
        const pluginsNames = this._plugins
        let plugin         = null
        let pluginName     = null
        let pluginPath     = null
        for ( let index = 0, numberOfPlugins = pluginsNames.length ; index < numberOfPlugins ; index++ ) {

            pluginName = pluginsNames[ index ]
            pluginPath = pluginName
            plugin     = null

            try {

                plugin           = require( pluginPath )
                plugin.__dirname = path.dirname( require.resolve( pluginPath ) )
                console.log( `Register package plugin: ${plugin.__dirname}` )

            } catch ( error ) {

                if ( !error.code || error.code !== 'MODULE_NOT_FOUND' ) {

                    console.error( `The plugin "${pluginName}" seems to encounter internal error !` )
                    console.error( error )
                    continue

                }

                try {

                    pluginPath       = path.join( __dirname, '../../../../../', 'databases/plugins/', pluginName, pluginName + '.js' )
                    plugin           = require( pluginPath )
                    plugin.__dirname = path.dirname( require.resolve( pluginPath ) )
                    console.log( `Register local plugin: ${plugin.__dirname}` )

                } catch ( error ) {

                    console.error( `Unable to register the plugin ${pluginPath} the package or local folder doesn't seem to exist ! Skip it.` )
                    continue

                }

            }

            if ( !( plugin instanceof TAbstractDatabasePlugin ) ) {
                console.error( `The plugin ${pluginName} doesn't seem to be an instance of an extended class from TAbstractDatabasePlugin ! Skip it.` )
                continue
            }

            plugin.registerTo( this._driver, this._application, this._router )

        }

    }

    connect () {}

    /**
     * startAutoConnect
     */
    startAutoConnect () {
        if ( this._autoConnectionTimer ) {
            return
        }

        this._autoConnectionTimer = setInterval( this.connect.bind( this ), this._autoReconnectTimeout )
    }

    /**
     * stopAutoConnect
     */
    stopAutoConnect () {
        if ( !this._autoConnectionTimer ) {
            return
        }

        clearInterval( this._autoConnectionTimer )
        this._autoConnectionTimer = null
    }

    close ( callback ) {}

    on ( eventName, callback ) {}

}

module.exports = TAbstractDatabase
