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

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: LevelUpDriver
            }
        }

        super( _parameters )

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

    init () {
        super.init()

    }

    on ( eventName, callback ) {}

}

module.exports = TLevelDBDatabase
