/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { TAbstractDatabase } from './TAbstractDatabase'
import { Mongoose as driver } from 'mongoose'

class TMongoDBDatabase extends TAbstractDatabase {

    constructor ( app, router, plugins, parameters ) {

        super( driver, app, router, plugins, parameters )

        this.databaseUrl = parameters.databaseUrl

    }

    _init () {}

    connect () {

        this._driver.connect( this.databaseUrl, {} )

    }

    close ( onCloseCallback ) {

        this._driver.connection.close( onCloseCallback )

    }

    on ( eventName, callback ) {

        const availableEventNames = [ 'connecting', 'connected', 'open', 'disconnecting', 'disconnected', 'reconnected', 'close', 'error' ]

        if ( availableEventNames.indexOf( eventName ) === -1 ) {
            return
        }

        this._driver.connection.on( eventName, callback )

    }

}

export { TMongoDBDatabase }
