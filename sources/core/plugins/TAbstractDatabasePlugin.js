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

    static _registerRoutesTo ( Driver, Application, Router, ControllerCtors, descriptors ) {

        for ( let index = 0, numberOfDescriptor = descriptors.length ; index < numberOfDescriptor ; index++ ) {

            const descriptor = descriptors[ index ]
            const controller = new ControllerCtors[ descriptor.controller.name ]( Driver, descriptor.controller.options )
            const router     = Router( { mergeParams: true } )

            Application.use( descriptor.route, TAbstractDatabasePlugin._populateRouter( router, controller, descriptor.controller.can ) )

        }

    }

    static _populateRouter ( router, controller, can = {} ) {

        for ( let _do in can ) {

            const action = can[ _do ]

            router[ action.on ]( action.over, controller[ _do ].bind( controller ) )

        }

        return router

    }

    constructor ( DefaultController ) {

        this._controllers = {
            undefined: DefaultController
        }
        this._descriptors = []

        this.__dirname = undefined

    }

    addController ( value ) {

        this._controllers[ value.name ] = value
        return this

    }

    addDescriptor ( value ) {

        this._descriptors.push( value )
        return this

    }

    beforeRegisterRoutes ( driver ) {}

    registerTo ( driver, application, router ) {

        this.beforeRegisterRoutes( driver )

        TAbstractDatabasePlugin._registerRoutesTo( driver, application, router, this._controllers, this._descriptors )

    }

}

module.exports = TAbstractDatabasePlugin
