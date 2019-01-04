/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const TAbstractDatabase = require( './TAbstractDatabase' )
const PgPromise         = require( 'pg-promise' )( {} )

class TPostgresDatabase extends TAbstractDatabase {

    constructor ( app, router, plugins, parameters ) {

        super( PgPromise( parameters.databaseUrl ), app, router, plugins, parameters )

        this.databaseUrl = parameters.databaseUrl
    }

    connect () {

        this._driver.one( ` SELECT 1 `, [] )
            .then( ( data ) => {
                console.log( `PostgreSQL at ${this.databaseUrl.host}:${this.databaseUrl.port}/${this.databaseUrl.database} is connected` )
            } )
            .catch( ( error ) => {
                console.log( 'PostgreSQL - Connection error ', error )
            } )
    }

    close ( onCloseCallback ) {}

    on ( eventName, callback ) {}

}

module.exports = TPostgresDatabase
