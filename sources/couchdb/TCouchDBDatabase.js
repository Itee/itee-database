/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import * as CouchDBDriver    from 'nano'
import { TAbstractDatabase } from '../core/databases/TAbstractDatabase'

class TCouchDBDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: CouchDBDriver
            }
        }

        super( _parameters )

    }

    close ( onCloseCallback ) {}

    connect () {

        var nano = this._driver( 'http://localhost:5984' )
        nano.db.create( 'books' )
        var books = nano.db.use( 'books' )

        // Insert a book document in the books database
        books.insert( { name: 'The Art of war' }, null, function ( err, body ) {
            if ( err ) {
                console.log( err )
            } else {
                console.log( body )
            }
        } )

        // Get a list of all books
        books.list( function ( err, body ) {
            if ( err ) {
                console.log( err )
            } else {
                console.log( body.rows )
            }
        } )

    }

    init () {
        super.init()

    }

    on ( eventName, callback ) {}
}

export { TCouchDBDatabase }
