/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import * as OracleDBDriver   from 'oracledb'
import { TAbstractDatabase } from '../core/databases/TAbstractDatabase'

//https://github.com/oracle/node-oracledb#-installation

class TOracleDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: OracleDBDriver
            }
        }

        super( _parameters )

    }

    close ( onCloseCallback ) {}

    connect () {

        const config = {
            user:          'DbUser',
            password:      'DbPassword',
            connectString: 'localhost:1521/orcl'
        }

        async function getEmployee ( empId ) {
            let conn

            try {
                conn = await this._driver.getConnection( config )

                const result = await conn.execute(
                    'select * from employees where employee_id = :id',
                    [ empId ]
                )

                console.log( result.rows[ 0 ] )
            } catch ( err ) {
                console.log( 'Ouch!', err )
            } finally {
                if ( conn ) { // conn assignment worked, need to close
                    await conn.close()
                }
            }
        }

        getEmployee( 101 )

    }

    on ( eventName, callback ) {}

    _initDatabase () {
        super._initDatabase()

    }

}

export { TOracleDatabase }
