/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TAbstractDatabasePlugin {

    constructor ( parameters ) {

        this.routes = {}

    }

    registerTo( dbDriver ) {

    }

    addRoutesTo( routes ) {

        let _routes = routes

        for ( let routeKey in this.routes ) {

            if ( _routes[ routeKey ] ) {
                console.warn( `Route controller for key ${routeKey} already exist, ignore it !` )
                continue
            }

            _routes[ routeKey ] = this.routes[ routeKey ]

        }

        return _routes

    }

}

export { TAbstractDatabasePlugin }
