/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const path                                = require( 'path' )
const { fileIsEmpty, getFilesPathsUnder } = require( 'itee-utils' )
const { isFunction }                      = require( 'itee-validators' )
const TAbstractDatabasePlugin             = require( './TAbstractDatabasePlugin' )
const TMongooseController                 = require( '../controllers/TMongooseController' )

class TMongoDBPlugin extends TAbstractDatabasePlugin {

    constructor () {
        super( TMongooseController )
    }

    static _registerTypesTo ( Mongoose, dirname ) {

        const typesBasePath   = path.join( dirname, 'types' )
        const typesFilesPaths = getFilesPathsUnder( typesBasePath )
        let typeFilePath      = ''
        let typeFile          = undefined

        for ( let typeIndex = 0, numberOfTypes = typesFilesPaths.length ; typeIndex < numberOfTypes ; typeIndex++ ) {

            typeFilePath = typesFilesPaths[ typeIndex ]

            if ( fileIsEmpty( typeFilePath, 200 ) ) {
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

        const localSchemasBasePath   = path.join( dirname, 'schemas' )
        const localSchemasFilesPaths = getFilesPathsUnder( localSchemasBasePath )
        let localSchemaFilePath      = ''
        let localSchemaFile          = undefined
        for ( let schemaIndex = 0, numberOfSchemas = localSchemasFilesPaths.length ; schemaIndex < numberOfSchemas ; schemaIndex++ ) {

            localSchemaFilePath = localSchemasFilesPaths[ schemaIndex ]

            if ( fileIsEmpty( localSchemaFilePath ) ) {

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

    beforeRegisterRoutes ( Mongoose ) {
        super.beforeRegisterRoutes( Mongoose )

        TMongoDBPlugin._registerTypesTo( Mongoose, this.__dirname )
        TMongoDBPlugin._registerSchemasTo( Mongoose, this.__dirname )

    }

}

module.exports = TMongoDBPlugin
