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
const Neo4JDriver       = require( 'apoc' )

class TNeo4JDatabase extends TAbstractDatabase {

    constructor ( app, router, plugins, parameters ) {
        super( Neo4JDriver, app, router, plugins, parameters )

        const _parameters = { ...{}, ...parameters }

    }

    close ( onCloseCallback ) {}

    connect () {

        this._driver.query( 'match (n) return n' ).exec().then(
            function ( response ) {
                console.log( response )
            },
            function ( fail ) {
                console.log( fail )
            }
        )

    }

    on ( eventName, callback ) {}

    _initDatabase () {
        super._initDatabase()

    }

}

module.exports = TNeo4JDatabase
