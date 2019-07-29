/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import * as CassandraDriver  from 'cassandra-driver'
import { TAbstractDatabase } from '../core/databases/TAbstractDatabase'

class TCassandraDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: CassandraDriver
            }
        }

        super( _parameters )

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

    init () {
        super.init()

    }

    on ( eventName, callback ) {}

}

export { TCassandraDatabase }
