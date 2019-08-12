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
import path                        from 'path'
import { TAbstractDatabasePlugin } from '../plugins/TAbstractDatabasePlugin'

class TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                driver:      null,
                application: null,
                router:      null,
                plugins:     []
            }, ...parameters
        }

        this.driver      = _parameters.driver
        this.application = _parameters.application
        this.router      = _parameters.router
        this.plugins     = _parameters.plugins

        this.init()

        this._registerPlugins()

    }

    get plugins () {

        return this._plugins

    }

    set plugins ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Plugins cannot be null ! Expect an array of TDatabasePlugin.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Plugins cannot be undefined ! Expect an array of TDatabasePlugin.' ) }

        this._plugins = value

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

        for ( let [ name, config ] of Object.entries(this._plugins) ) {

        }

        for ( let pluginName in this._plugins ) {

            if ( !Object.prototype.hasOwnProperty.call( this._plugins, pluginName ) ) { continue }

            const pluginConfig = this._plugins[ pluginName ]

            if ( this._registerPackagePlugin( pluginName, pluginConfig ) ) {

                console.log( `Use ${pluginName} plugin from node_modules` )

            } else if ( this._registerLocalPlugin( pluginName, pluginConfig ) ) {

                console.log( `Use ${pluginName} plugin from local folder` )

            } else {

                console.error( `Unable to register the plugin ${pluginPath} the package or local folder doesn't seem to exist ! Skip it.` )

            }

        }

    }

    _registerPackagePlugin ( name ) {

        let success = false

        try {

            const plugin = require( name )
            if ( plugin instanceof TAbstractDatabasePlugin ) {

                plugin.__dirname = path.dirname( require.resolve( name ) )
                plugin.registerTo( this._driver, this._application, this._router )

                success = true

            } else {

                console.error( `The plugin ${name} doesn't seem to be an instance of an extended class from TAbstractDatabasePlugin ! Skip it.` )

            }

        } catch ( error ) {

            if ( !error.code || error.code !== 'MODULE_NOT_FOUND' ) {

                console.error( error )

            }

        }

        return success

    }

    _registerLocalPlugin ( name, path ) {

        let success = false

        try {

            // todo use rootPath or need to resolve depth correctly !
            const localPluginPath = path.join( __dirname, '../../../', 'databases/plugins/', name, name + '.js' )
            const plugin          = require( localPluginPath )

            if ( plugin instanceof TAbstractDatabasePlugin ) {

                plugin.__dirname = path.dirname( require.resolve( localPluginPath ) )
                plugin.registerTo( this._driver, this._application, this._router )

                success = true

            } else {

                console.error( `The plugin ${name} doesn't seem to be an instance of an extended class from TAbstractDatabasePlugin ! Skip it.` )

            }

        } catch ( error ) {

            console.error( error )

        }

        return success

    }

    connect () {}

    close ( /*callback*/ ) {}

    on ( /*eventName, callback*/ ) {}

}

export { TAbstractDatabase }
