/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import path from 'path'

class TAbstractDatabase {

    constructor ( driver, plugins = [], autoReconnectTimeout = 10000 ) {


        this.routes = {}

        this._driver = driver
        this._plugins = plugins
        this._autoReconnectTimeout = autoReconnectTimeout
        this._autoConnectionTimer = null

        this.__init()

    }

    __init () {

        const pluginsBasePath = path.join( __dirname, '..', 'node_modules' )
        const pluginsNames    = this._plugins

        for ( let index = 0, numberOfPlugins = pluginsNames.length ; index < numberOfPlugins ; index++ ) {
            const pluginPath = path.join( pluginsBasePath, pluginsNames[ index ] )
            const plugin     = require( pluginPath )
            this.__registerPlugin( plugin )
        }

        this._init()

    }

    _init () {

        console.error( 'TAbstractDatabase._init: Need to be reimplemented in inherited class !' )

    }

    __registerPlugin ( plugin ) {

        const routes = plugin.routes
        for ( let routeKey in routes ) {

            if ( this.routes[ routeKey ] ) {
                console.warn( `Route controller for key ${routeKey} already exist, ignore it !` )
                continue
            }

            this.routes[ routeKey ] = routes[ routeKey ]

        }

        this._registerPlugin( plugin )

    }

    _registerPlugin ( plugin ) {

        console.error( 'TAbstractDatabase._registerPlugin: Need to be reimplemented in inherited class !' )

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

export { TAbstractDatabase }
