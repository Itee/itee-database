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
const CouchDBDriver     = require( 'nano' )

class TCouchDBDatabase extends TAbstractDatabase {

    constructor ( app, router, plugins, parameters ) {
        super( CouchDBDriver, app, router, plugins, parameters )

        const _parameters = { ...{}, ...parameters }

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

    on ( eventName, callback ) {}

    _initDatabase () {
        super._initDatabase()

    }

}

module.exports = TCouchDBDatabase
