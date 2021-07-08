/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import {
    isNull,
    isUndefined
}                                  from 'itee-validators'
import { TAbstractObject }         from 'itee-core'
import path                        from 'path'
import { TAbstractDatabasePlugin } from '../plugins/TAbstractDatabasePlugin'

class TAbstractDatabase extends TAbstractObject {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                driver:      null,
                application: null,
                router:      null,
                plugins:     []
            },
            ...parameters
        }

        super( _parameters )

        this.driver      = _parameters.driver
        this.application = _parameters.application
        this.router      = _parameters.router
        this.plugins     = _parameters.plugins
    }

    get plugins () {

        return this._plugins

    }

    set plugins ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Plugins cannot be null ! Expect an array of TDatabasePlugin.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Plugins cannot be undefined ! Expect an array of TDatabasePlugin.' ) }

        this._plugins = value
        this._registerPlugins()

    }

    get router () {

        return this._router

    }

    set router ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Router cannot be null ! Expect a Express Router.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Router cannot be undefined ! Expect a Express Router.' ) }

        this._router = value

    }

    get application () {

        return this._application

    }

    set application ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Application cannot be null ! Expect a Express Application.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Application cannot be undefined ! Expect a Express Application.' ) }

        this._application = value

    }

    get driver () {

        return this._driver

    }

    set driver ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Driver cannot be null ! Expect a database driver.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Driver cannot be undefined ! Expect a database driver.' ) }

        this._driver = value

    }

    setPlugins ( value ) {

        this.plugins = value
        return this

    }

    addPlugin ( value ) {

        this._plugins.push( value )

        const [ key, data ] = Object.entries( value )[ 0 ]
        this._registerPlugin( key, data )

        return this

    }

    setRouter ( value ) {

        this.router = value
        return this

    }

    setApplication ( value ) {

        this.application = value
        return this

    }

    setDriver ( value ) {

        this.driver = value
        return this

    }

    init () {}

    _registerPlugins () {

        for ( let [ name, config ] of Object.entries( this._plugins ) ) {
            this._registerPlugin( name, config )
        }

    }

    _registerPlugin ( name, config ) {

        if ( this._registerPackagePlugin( name, config ) ) { return }
        if ( this._registerLocalPlugin( name, config ) ) { return }

        this.logger.error( `Unable to register the plugin ${ name } the package or local folder doesn't seem to exist ! Skip it.` )

    }

    _registerPackagePlugin ( name, config ) {

        let success = false

        try {

            const plugin = require( name )( config )
            if ( plugin instanceof TAbstractDatabasePlugin ) {

                this.logger.log( `Use ${ name } plugin from node_modules` )
                plugin.__dirname = path.dirname( require.resolve( name ) )
                plugin.registerTo( this.driver, this.application, this.router )

                success = true

            } else {

                this.logger.error( `The plugin ${ name } doesn't seem to be an instance of an extended class from TAbstractDatabasePlugin ! Skip it.` )

            }

        } catch ( error ) {

            if ( !error.code || error.code !== 'MODULE_NOT_FOUND' ) {

                this.logger.error( error )

            }

        }

        return success

    }

    _registerLocalPlugin ( name, config ) {

        let success = false

        try {

            // todo use rootPath or need to resolve depth correctly !
            const localPluginPath = path.join( __dirname, '../../../', 'databases/plugins/', name, `${ name }.js` )
            const plugin          = require( localPluginPath )( config )

            if ( plugin instanceof TAbstractDatabasePlugin ) {

                this.logger.log( `Use ${ name } plugin from local folder` )
                plugin.__dirname = path.dirname( require.resolve( localPluginPath ) )
                plugin.registerTo( this.driver, this.application, this.router )

                success = true

            } else {

                this.logger.error( `The plugin ${ name } doesn't seem to be an instance of an extended class from TAbstractDatabasePlugin ! Skip it.` )

            }

        } catch ( error ) {

            this.logger.error( error )

        }

        return success

    }

    connect () {}

    close ( /*callback*/ ) {}

    on ( /*eventName, callback*/ ) {}

}

export { TAbstractDatabase }
