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
const driver            = require( 'pg-promise' )({})

class TPostgresDatabase extends TAbstractDatabase {

    constructor ( app, router, plugins, parameters ) {

        super( driver(parameters.databaseUrl), app, router, plugins, parameters )

    }

    _init () {}

    connect () {}
 
    close ( onCloseCallback ) {}

    on ( eventName, callback ) {}

}

module.exports = TPostgresDatabase
