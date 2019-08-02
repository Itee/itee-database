/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import PostgreSQL            from 'pg-promise'
import { TAbstractDatabase } from '../core/databases/TAbstractDatabase'

const PostgreSQLDriver = PostgreSQL( {} )

class TPostgreSQLDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                host:     'localhost',
                port:     '5432',
                database: 'postgres'
            },
            ...parameters,
            ...{
                driver: PostgreSQLDriver
            }
        }

        super( _parameters )

        this._host     = _parameters.host
        this._port     = _parameters.port
        this._database = _parameters.database

    }

    close ( /*onCloseCallback*/ ) {}

    connect () {

        this._driver.one( ` SELECT 1 `, [] )
            .then( ( data ) => {
                console.log( `PostgreSQL at ${this._host}:${this._port}/${this._database} is connected ! ${data}` )
            } )
            .catch( ( error ) => {
                console.log( 'PostgreSQL - Connection error ', error )
            } )
    }

    init () {
        super.init()

    }

    on ( /*eventName, callback*/ ) {}

}

export { TPostgreSQLDatabase }
