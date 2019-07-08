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
const MySQLDriver       = require( 'mysql' )

class TMySQLDatabase extends TAbstractDatabase {

    constructor ( app, router, plugins, parameters ) {
        super( MySQLDriver, app, router, plugins, parameters )

        const _parameters = { ...{}, ...parameters }

    }

    close ( onCloseCallback ) {}

    connect () {

        var connection = this._driver.createConnection( {
            host:     'localhost',
            user:     'dbuser',
            password: 's3kreee7',
            database: 'my_db'
        } )

        connection.connect()

        connection.query( 'SELECT 1 + 1 AS solution', function ( err, rows, fields ) {
            if ( err ) {
                throw err
            }

            console.log( 'The solution is: ', rows[ 0 ].solution )
        } )

        connection.end()

    }

    on ( eventName, callback ) {}

    _initDatabase () {
        super._initDatabase()

    }

}

module.exports = TMySQLDatabase
