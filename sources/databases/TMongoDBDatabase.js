/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const TAbstractDatabase = require( './TAbstractDatabase' )
const Mongoose          = require( 'mongoose' )

class TMongoDBDatabase extends TAbstractDatabase {

    constructor ( app, router, plugins, parameters ) {

        super( Mongoose, app, router, plugins, parameters )

        this.databaseUrl = parameters.databaseUrl

    }

    close ( onCloseCallback ) {

        this._driver.connection.close( onCloseCallback )

    }

    connect () {

        const self = this
        this._driver.connect( this.databaseUrl, { useNewUrlParser: true } )
            .then( ( info ) => {
                console.log( `MongoDB at ${this.databaseUrl} is connected !` )
                self.stopAutoConnect()
            } )
            .catch( err => {
                console.error( err )
                self.startAutoConnect()
            } )

    }

    on ( eventName, callback ) {

        const availableEventNames = [ 'connecting', 'connected', 'open', 'disconnecting', 'disconnected', 'reconnected', 'close', 'error' ]

        if ( availableEventNames.indexOf( eventName ) === -1 ) {
            return
        }

        this._driver.connection.on( eventName, callback )

    }

}

module.exports = TMongoDBDatabase
