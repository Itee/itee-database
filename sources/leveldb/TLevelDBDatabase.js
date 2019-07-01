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
const LevelUpDriver     = require( 'levelup' )

class TLevelDBDatabase extends TAbstractDatabase {

    constructor ( app, router, plugins, parameters ) {
        super( LevelUpDriver, app, router, plugins, parameters )

        const _parameters = { ...{}, ...parameters }

    }

    close ( onCloseCallback ) {}

    connect () {

        var db = this._driver( './mydb' )

        db.put( 'name', 'LevelUP', function ( err ) {
            if ( err ) {
                return console.log( 'Ooops!', err )
            }

            db.get( 'name', function ( err, value ) {
                if ( err ) {
                    return console.log( 'Ooops!', err )
                }

                console.log( 'name=' + value )
            } )
        } )

    }

    on ( eventName, callback ) {}

    _initDatabase () {
        super._initDatabase()

    }

}

module.exports = TLevelDBDatabase
