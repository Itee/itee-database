/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const path                    = require( 'path' )
const TAbstractDatabasePlugin = require( '../plugins/TAbstractDatabasePlugin' )

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

        // Register modules plugins
        const pluginsNames = this._plugins
        let plugin         = null
        let pluginName     = null
        let pluginPath     = null
        for ( let index = 0, numberOfPlugins = pluginsNames.length ; index < numberOfPlugins ; index++ ) {

            pluginName = pluginsNames[ index ]
            pluginPath = pluginName
            plugin     = null

            try {

                plugin           = require( pluginPath )
                plugin.__dirname = path.dirname( require.resolve( pluginPath ) )
                console.log( `Register package plugin: ${plugin.__dirname}` )

            } catch ( error ) {

                if ( !error.code || error.code !== 'MODULE_NOT_FOUND' ) {

                    console.error( `The plugin "${pluginName}" seems to encounter internal error !` )
                    console.error( error )
                    continue

                }

                try {

                    pluginPath       = path.join( __dirname, '../../../../../', 'databases/plugins/', pluginName, pluginName + '.js' )
                    plugin           = require( pluginPath )
                    plugin.__dirname = path.dirname( require.resolve( pluginPath ) )
                    console.log( `Register local plugin: ${plugin.__dirname}` )

                } catch ( error ) {

                    console.error( `Unable to register the plugin ${pluginPath} the package or local folder doesn't seem to exist ! Skip it.` )
                    continue

                }

            }

            if ( !( plugin instanceof TAbstractDatabasePlugin ) ) {
                console.error( `The plugin ${pluginName} doesn't seem to be an instance of an extended class from TAbstractDatabasePlugin ! Skip it.` )
                continue
            }

            plugin.registerTo( this._driver, this._application, this._router )

        }

    }

    connect () {}

    close ( callback ) {}

    on ( eventName, callback ) {}

}

module.exports = TAbstractDatabase
