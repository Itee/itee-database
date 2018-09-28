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

    static _populateRouter ( Router, controller, can ) {

        const router = Router( { mergeParams: true } )

        const canCreate = (can.create === undefined) ? {
            one:                true,
            handlerNameForOne:  'create',
            many:               true,
            handlerNameForMany: 'create'
        } : can.create
        if ( canCreate ) {
            if ( canCreate.one ) {router.put( '/', controller[ canCreate.handlerName ].bind( controller ) ) }
            if ( canCreate.many ) { router.put( '/:id', controller[ canCreate.handlerName ].bind( controller ) ) }
        }

        const canRead = (can.read === undefined) ? {
            one:                true,
            handlerNameForOne:  'read',
            many:               true,
            handlerNameForMany: 'read'
        } : can.read
        if ( canRead ) {
            if ( canRead.one ) { router.post( '/', controller[ canRead.handlerName ].bind( controller ) ) }
            if ( canRead.many ) { router.post( '/:id', controller[ canRead.handlerName ].bind( controller ) ) }
        }

        const canUpdate = (can.update === undefined) ? {
            one:                true,
            handlerNameForOne:  'update',
            many:               true,
            handlerNameForMany: 'update'
        } : can.update
        if ( canUpdate ) {
            if ( canUpdate.one ) { router.patch( '/', controller[ canUpdate.handlerName ].bind( controller ) ) }
            if ( canUpdate.many ) { router.patch( '/:id', controller[ canUpdate.handlerName ].bind( controller ) ) }
        }

        const canDelete = (can.delete === undefined) ? {
            one:                true,
            handlerNameForOne:  'delete',
            many:               true,
            handlerNameForMany: 'delete'
        } : can.delete
        if ( canDelete ) {
            if ( canDelete.one ) { router.delete( '/', controller[ canDelete.handlerName ].bind( controller ) ) }
            if ( canDelete.many ) { router.delete( '/:id', controller[ canDelete.handlerName ].bind( controller ) ) }
        }

        // Todo: i return not found
        router.all( '*/*', ( request, response, next ) => {

            response.status( 404 ).send()

        } )

        return router

    }

    constructor ( DefaultController ) {

        this._controllers = {
            _default: DefaultController
        }
        this._descriptors = []

    }

    addController( value ) {

        this._controllers[value.constructor.name] = value
        return this

    }

    getController( name ) {

        return (name) ? this._controllers[ name ] : this._controllers._default

    }

    addDescriptor( value ) {

        this._descriptors.push( value )
        return this

    }

    _registerRoutesTo ( Mongoose, Application, Router ) {

        const descriptors = this._descriptors
        for ( let index = 0, numberOfDescriptor = descriptors.length ; index < numberOfDescriptor ; index++ ) {

            const descriptor = descriptors[ index ]

            const ControllerCtor = this.getController()
            const controller = new ControllerCtor( Mongoose, descriptor.controller.options )

            Application.use( descriptor.route, TAbstractDatabasePlugin._populateRouter( Router, controller, descriptor.controller.can ) )

        }

    }

    beforeRegisterRoutes( driver ) {}

    registerTo ( driver, application, router ) {

        this.beforeRegisterRoutes( driver )

        this._registerRoutesTo( driver, application, router )


    }

}

module.exports = TAbstractDatabasePlugin
