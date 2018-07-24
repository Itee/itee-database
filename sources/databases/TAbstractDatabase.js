/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TAbstractDatabase {

    constructor ( driver, application, router, plugins = [], autoReconnectTimeout = 10000 ) {

        this.routes = {}

        this._driver               = driver
        this._application          = application
        this._router               = router
        this._plugins              = plugins
        this._autoReconnectTimeout = autoReconnectTimeout
        this._autoConnectionTimer  = null

        this.__init()

    }

    __init () {

        // Register modules plugins
        const pluginsNames = this._plugins
        for ( let index = 0, numberOfPlugins = pluginsNames.length ; index < numberOfPlugins ; index++ ) {

            const pluginName = pluginsNames[ index ]
            let plugin       = undefined

            try {
                plugin = require( pluginName )
            } catch ( error ) {
                console.error( `Unable to register plugin ${pluginName} the package doesn't seem to exist ! Skip it.` )
                continue
            }

            plugin.registerTo( this._driver, this._application, this._router )

        }

        this._init()

    }

    _init () {

        console.error( 'TAbstractDatabase._init: Need to be reimplemented in inherited class !' )

    }

    connect () {

        console.error( 'TAbstractDatabase.connect: Need to be reimplemented in inherited class !' )

    }

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

    close ( callback ) {

        console.error( 'TAbstractDatabase.close: Need to be reimplemented in inherited class !' )

    }

    on ( eventName, callback ) {

        console.error( 'TAbstractDatabase.on: Need to be reimplemented in inherited class !' )

    }

}

module.exports = TAbstractDatabase
