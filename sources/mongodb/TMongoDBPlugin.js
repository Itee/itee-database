/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import { getFilesPathsUnder }      from 'itee-utils'
import {
    isEmptyFile,
    isFunction,
    isInvalidDirectoryPath
}                                  from 'itee-validators'
import path                        from 'path'
import { TAbstractDatabasePlugin } from '../core/plugins/TAbstractDatabasePlugin'

class TMongoDBPlugin extends TAbstractDatabasePlugin {

    get schemas () {
        return this._schemas
    }

    set schemas ( value ) {
        this._schemas = value
    }

    addSchema( value ) {

        this._schemas.push(value)
        return this
        
    }

    get types () {
        return this._types
    }

    set types ( value ) {
        this._types = value
    }

    addType ( value ) {

        this._types.push( value )
        return this

    }

    static _registerTypesTo ( Mongoose, dirname ) {

        const typesBasePath = path.join( dirname, 'types' )
        if ( isInvalidDirectoryPath( typesBasePath ) ) {
            console.warn( `Unable to find "types" folder for path "${typesBasePath}"` )
            return
        }

        const typesFilesPaths = getFilesPathsUnder( typesBasePath )
        let typeFilePath      = ''
        let typeFile          = undefined

        for ( let typeIndex = 0, numberOfTypes = typesFilesPaths.length ; typeIndex < numberOfTypes ; typeIndex++ ) {

            typeFilePath = typesFilesPaths[ typeIndex ]

            if ( isEmptyFile( typeFilePath, 200 ) ) {

                console.warn( `Skip empty core database schema: ${typeFilePath}` )
                continue

            }

            typeFile = require( typeFilePath )

            if ( isFunction( typeFile ) ) {

                console.log( `Register type: ${typeFilePath}` )
                typeFile( Mongoose )

            } else {

                console.error( `Unable to register type: ${typeFilePath}` )

            }

        }

    }

    static _registerSchemasTo ( Mongoose, dirname ) {

        const localSchemasBasePath = path.join( dirname, 'schemas' )
        if ( isInvalidDirectoryPath( localSchemasBasePath ) ) {
            console.warn( `Unable to find "schemas" folder for path "${localSchemasBasePath}"` )
            return
        }

        const localSchemasFilesPaths = getFilesPathsUnder( localSchemasBasePath )
        let localSchemaFilePath      = ''
        let localSchemaFile          = undefined
        for ( let schemaIndex = 0, numberOfSchemas = localSchemasFilesPaths.length ; schemaIndex < numberOfSchemas ; schemaIndex++ ) {

            localSchemaFilePath = localSchemasFilesPaths[ schemaIndex ]

            if ( isEmptyFile( localSchemaFilePath ) ) {

                console.warn( `Skip empty local database schema: ${localSchemaFilePath}` )
                continue

            }

            localSchemaFile = require( localSchemaFilePath )

            if ( isFunction( localSchemaFile ) ) {

                console.log( `Direct register local database schema: ${localSchemaFilePath}` )
                localSchemaFile( Mongoose )

            } else if ( isFunction( localSchemaFile.registerModelTo ) ) {

                console.log( `Register local database schema: ${localSchemaFilePath}` )
                localSchemaFile.registerModelTo( Mongoose )

            } else {

                console.error( `Unable to register local database schema: ${localSchemaFilePath}` )

            }

        }

    }

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                types:   [],
                schemas: []
            },
            ...parameters
        }

        super( _parameters )

        this.types   = _parameters.types
        this.schemas = _parameters.schemas

    }

    beforeRegisterRoutes ( Mongoose ) {

        super.beforeRegisterRoutes( Mongoose )

        this._registerTypes( Mongoose )
        TMongoDBPlugin._registerTypesTo( Mongoose, this.__dirname )

        this._registerSchemas( Mongoose )
        TMongoDBPlugin._registerSchemasTo( Mongoose, this.__dirname )

    }

    _registerTypes ( Mongoose ) {

        for ( let type of this._types ) {

            console.log( `Register type: ${type.name}` )
            type( Mongoose )

        }

    }

    _registerSchemas ( Mongoose ) {

        for ( let schema of this._schemas ) {

            console.log( `Register schema: ${schema.name}` )

            if ( isFunction( schema ) ) {

                console.log( `Direct register local database schema: ${schema}` )
                schema( Mongoose )

            } else if ( isFunction( schema.registerModelTo ) ) {

                console.log( `Register local database schema: ${schema}` )
                schema.registerModelTo( Mongoose )

            } else {

                console.error( `Unable to register local database schema: ${schema}` )

            }

        }

    }

}

export { TMongoDBPlugin }
