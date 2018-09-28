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

    constructor ( DefaultController ) {

        this._controllers = {
            undefined: DefaultController
        }
        this._descriptors = []

        this.__dirname = undefined

    }

    static _registerRoutesTo ( Mongoose, Application, Router, ControllerCtors, descriptors ) {

        for ( let index = 0, numberOfDescriptor = descriptors.length ; index < numberOfDescriptor ; index++ ) {

            const descriptor = descriptors[ index ]
            const controller = new ControllerCtors[ descriptor.controller.name ]( Mongoose, descriptor.controller.options )

            Application.use( descriptor.route, TAbstractDatabasePlugin._populateRouter( Router, controller, descriptor.controller.can ) )

        }

    }

    static _populateRouter ( Router, controller, can = {} ) {

        const router = Router( { mergeParams: true } )

        const canCreate = (can.create === undefined) ? {
            one:                true,
            handlerNameForOne:  'create',
            many:               true,
            handlerNameForMany: 'create'
        } : can.create
        if ( canCreate ) {
            if ( canCreate.one ) {router.put( '/', controller[ canCreate.handlerNameForOne ].bind( controller ) ) }
            if ( canCreate.many ) { router.put( '/:id', controller[ canCreate.handlerNameForMany ].bind( controller ) ) }
        }

        const canRead = (can.read === undefined) ? {
            one:                true,
            handlerNameForOne:  'read',
            many:               true,
            handlerNameForMany: 'read'
        } : can.read
        if ( canRead ) {
            if ( canRead.one ) { router.post( '/', controller[ canRead.handlerNameForOne ].bind( controller ) ) }
            if ( canRead.many ) { router.post( '/:id', controller[ canRead.handlerNameForMany ].bind( controller ) ) }
        }

        const canUpdate = (can.update === undefined) ? {
            one:                true,
            handlerNameForOne:  'update',
            many:               true,
            handlerNameForMany: 'update'
        } : can.update
        if ( canUpdate ) {
            if ( canUpdate.one ) { router.patch( '/', controller[ canUpdate.handlerNameForOne ].bind( controller ) ) }
            if ( canUpdate.many ) { router.patch( '/:id', controller[ canUpdate.handlerNameForMany ].bind( controller ) ) }
        }

        const canDelete = (can.delete === undefined) ? {
            one:                true,
            handlerNameForOne:  'delete',
            many:               true,
            handlerNameForMany: 'delete'
        } : can.delete
        if ( canDelete ) {
            if ( canDelete.one ) { router.delete( '/', controller[ canDelete.handlerNameForOne ].bind( controller ) ) }
            if ( canDelete.many ) { router.delete( '/:id', controller[ canDelete.handlerNameForMany ].bind( controller ) ) }
        }

        // Todo: i return not found
        router.all( '*/*', ( request, response, next ) => {

            response.status( 404 ).send()

        } )

        return router

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
