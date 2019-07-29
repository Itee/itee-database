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
}                                  from '../../node_modules/itee-validators/builds/itee-validators.cjs'
import path                        from 'path'
import { TAbstractDatabasePlugin } from '../core/plugins/TAbstractDatabasePlugin'
import { TMongooseController }     from './TMongooseController'

class TMongoDBPlugin extends TAbstractDatabasePlugin {

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

    constructor () {
        super( { controllers: new Map( [ [ 'TMongooseController', TMongooseController ] ] ) } )
    }

    beforeRegisterRoutes ( Mongoose ) {
        super.beforeRegisterRoutes( Mongoose )

        TMongoDBPlugin._registerTypesTo( Mongoose, this.__dirname )
        TMongoDBPlugin._registerSchemasTo( Mongoose, this.__dirname )

    }

}

export { TMongoDBPlugin }
