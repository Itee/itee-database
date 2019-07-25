/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const TAbstractDatabase = require( '../core/databases/TAbstractDatabase' )
const MongoDBDriver     = require( 'mongoose' )

class TMongoDBDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                databaseUrl: ''
            },
            ...parameters,
            ...{
                driver: MongoDBDriver
            }
        }

        super( _parameters )

        this.databaseUrl = _parameters.databaseUrl

    }

    close ( onCloseCallback ) {

        this._driver.connection.close( onCloseCallback )

    }

    connect () {

        this._driver.connect( this.databaseUrl, { useNewUrlParser: true } )
            .then( ( info ) => {
                console.log( `MongoDB at ${this.databaseUrl} is connected !` )
            } )
            .catch( ( err ) => {
                console.error( err )
            } )

    }

    init () {
        super.init()

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
