/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const TAbstractDatabase = require( './TAbstractDatabase' )
const driver            = require( 'pg-promise' )

class TPostgresDatabase extends TAbstractDatabase {

    constructor ( app, router, plugins, parameters ) {

        super( driver, app, router, plugins, parameters )

        this.databaseUrl = parameters.databaseUrl

    }

    _init () {}

    connect () {

        this._driver( this.databaseUrl )

    }

    close ( onCloseCallback ) {

        this._driver.end()

    }

    on ( eventName, callback ) {

        const availableEventNames = [ 'connect', 'disconnect', 'error', 'extend', 'query', 'receive', 'task', 'transact' ]

        if ( availableEventNames.indexOf( eventName ) === -1 ) {
            return
        }

        this._driver.on( eventName, callback )

    }

}

module.exports = TPostgresDatabase
