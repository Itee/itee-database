/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import * as SQLiteDriver     from 'sqlite3'
import { TAbstractDatabase } from '../core/databases/TAbstractDatabase'

class TSQLiteDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: SQLiteDriver
            }
        }

        super( _parameters )

    }

    close ( /*onCloseCallback*/ ) {}

    connect () {

        var db = new this._driver.Database( ':memory:' )

        db.serialize( function () {
            db.run( 'CREATE TABLE lorem (info TEXT)' )
            var stmt = db.prepare( 'INSERT INTO lorem VALUES (?)' )

            for ( var i = 0 ; i < 10 ; i++ ) {
                stmt.run( 'Ipsum ' + i )
            }

            stmt.finalize()

            db.each( 'SELECT rowid AS id, info FROM lorem', function ( err, row ) {
                console.log( row.id + ': ' + row.info )
            } )
        } )

        db.close()

    }

    init () {
        super.init()

    }

    on ( /*eventName, callback*/ ) {}
}

export { TSQLiteDatabase }

