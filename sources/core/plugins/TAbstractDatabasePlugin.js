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

            console.log( `\tAdd controller for base route: ${descriptor.route}` )
            Application.use( descriptor.route, TAbstractDatabasePlugin._populateRouter( router, controller, descriptor.controller.can ) )

        }

    }

    static _populateRouter ( router, controller, can = {} ) {

        for ( let _do in can ) {

            const action = can[ _do ]

            console.log( `\t\tMap route ${action.over} on (${action.on}) to ${controller.constructor.name}.${_do} method.` )
            router[ action.on ]( action.over, controller[ _do ].bind( controller ) )

        }

        return router

    }

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                controllers: new Map(),
                descriptors: []
            }, ...parameters
        }

        this.controllers = _parameters.controllers
        this.descriptors = _parameters.descriptors

        this.__dirname   = undefined

    }

    get controllers () {
        return this._controllers
    }

    set controllers ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Controllers cannot be null ! Expect a map of controller.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Controllers cannot be undefined ! Expect a map of controller.' ) }
        if ( !( value instanceof Map ) ) { throw new TypeError( `Controllers cannot be an instance of ${value.constructor.name} ! Expect a map of controller.` ) }

        this._controllers = value

    }

    get descriptors () {
        return this._descriptors
    }

    set descriptors ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Descriptors cannot be null ! Expect an array of POJO.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Descriptors cannot be undefined ! Expect an array of POJO.' ) }

        this._descriptors = value

    }

    addController ( value ) {

        this._controllers.set( value.name, value )
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
