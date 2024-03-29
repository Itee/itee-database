/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 */

import { TAbstractObject } from 'itee-core'
import {
    isNull,
    isUndefined
}                          from 'itee-validators'

class TAbstractDatabasePlugin extends TAbstractObject {

    static _registerRoutesTo ( Driver, Application, Router, ControllerCtors, descriptors, Logger ) {

        for ( let index = 0, numberOfDescriptor = descriptors.length ; index < numberOfDescriptor ; index++ ) {

            const descriptor      = descriptors[ index ]
            const ControllerClass = ControllerCtors.get( descriptor.controller.name )
            const controller      = new ControllerClass( {
                driver: Driver,
                ...descriptor.controller.options
            } )
            const router          = Router( { mergeParams: true } )

            Logger.log( `\tAdd controller for base route: ${ descriptor.route }` )
            Application.use( descriptor.route, TAbstractDatabasePlugin._populateRouter( router, controller, descriptor.controller.can, Logger ) )

        }

    }
    static _populateRouter ( router, controller, can = {}, Logger ) {

        for ( let _do in can ) {

            const action = can[ _do ]

            Logger.log( `\t\tMap route ${ action.over } on (${ action.on }) to ${ controller.constructor.name }.${ _do } method.` )
            router[ action.on ]( action.over, controller[ _do ].bind( controller ) )

        }

        return router

    }
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                controllers: new Map(),
                descriptors: []
            },
            ...parameters
        }

        super( _parameters )

        this.controllers = _parameters.controllers
        this.descriptors = _parameters.descriptors

        this.__dirname = undefined

    }
    get controllers () {
        return this._controllers
    }
    set controllers ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Controllers cannot be null ! Expect a map of controller.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Controllers cannot be undefined ! Expect a map of controller.' ) }
        if ( !( value instanceof Map ) ) { throw new TypeError( `Controllers cannot be an instance of ${ value.constructor.name } ! Expect a map of controller.` ) }

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

    beforeRegisterRoutes ( /*driver*/ ) {}

    registerTo ( driver, application, router ) {

        this.beforeRegisterRoutes( driver )

        TAbstractDatabasePlugin._registerRoutesTo( driver, application, router, this._controllers, this._descriptors, this.logger )

    }

}

export { TAbstractDatabasePlugin }
