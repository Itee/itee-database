/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const TAbstractDatabase = require( '../core/databases/TAbstractDatabase' )
const CassandraDriver   = require( 'cassandra-driver' )

class TCassandraDatabase extends TAbstractDatabase {

    constructor ( app, router, plugins, parameters ) {
        super( CassandraDriver, app, router, plugins, parameters )

        const _parameters = { ...{}, ...parameters }

    }

    close ( onCloseCallback ) {}

    connect () {

        const client = new this._driver.Client( { contactPoints: [ 'localhost' ] } )

        client.execute( 'select key from system.local', function ( err, result ) {
            if ( err ) {
                throw err
            }
            console.log( result.rows[ 0 ] )
        } )

    }

    on ( eventName, callback ) {}

    _initDatabase () {
        super._initDatabase()

    }

}

module.exports = TCassandraDatabase
