/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TDatabaseController
 * @classdesc The TDatabaseController is the base class to perform CRUD operations on the database
 */

import {
    isArray,
    isBlankString,
    isDefined,
    isEmptyArray,
    isEmptyObject,
    isEmptyString,
    isNotArray,
    isNotBoolean,
    isNotDefined,
    isNotObject,
    isNotString,
    isNull,
    isObject,
    isUndefined
}                                   from 'itee-validators'
import { TAbstractResponder }       from '../databases/TAbstractResponder'
import { UnprocessableEntityError } from '../messages/http/UnprocessableEntityError'

/**
 * @class
 * @classdesc The TDatabaseController is the base class to perform CRUD operations on the database
 * @augments module:Databases/TAbstractResponder~TAbstractResponder
 */
class TAbstractDataController extends TAbstractResponder {

    get useNext () {
        return this._useNext
    }

    set useNext ( value ) {
        if ( isNull( value ) ) { throw new TypeError( 'Driver cannot be null ! Expect a database driver.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Driver cannot be undefined ! Expect a database driver.' ) }
        if ( isNotBoolean( value ) ) { throw new TypeError( 'Driver cannot be undefined ! Expect a database driver.' ) }

        this._useNext = value
    }

    get driver () {
        return this._driver
    }

    set driver ( value ) {
        if ( isNull( value ) ) { throw new TypeError( 'Driver cannot be null ! Expect a database driver.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Driver cannot be undefined ! Expect a database driver.' ) }

        this._driver = value
    }

    /**
     * @constructor
     * @param {Object} [parameters={}] - An object containing all parameters to pass through the inheritance chain to initialize this instance
     * @param {external:Others~DatabaseDriver} parameters.driver Any official database driver that will be used internally by inherited class
     * @param {boolean} [parameters.useNext=false] A boolean flag to indicate that this instance should use "next()" function instead of return response to client.
     */
    constructor ( parameters ) {

        const _parameters = {
            ...{
                driver:  null,
                useNext: false
            },
            ...parameters
        }

        super(_parameters)

        /**
         * The database drive to use internally
         * @throws {TypeError} Will throw an error if the argument is null.
         * @throws {TypeError} Will throw an error if the argument is undefined.
         */
        this.driver  = _parameters.driver
        this.useNext = _parameters.useNext

    }

    //////////////////
    // CRUD Methods //
    //////////////////

    create ( request, response, next ) {

        const data = request.body

        if ( isNotDefined( data ) ) {

            TAbstractDataController.returnError(
                new UnprocessableEntityError( 'Le corps de la requete ne peut pas être null ou indefini.' ),
                ( this.useNext ) ? next : response
            )

        } else if ( isArray( data ) ) {

            if ( isEmptyArray( data ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'objet de la requete ne peut pas être vide.` ),
                    ( this.useNext ) ? next : response
                )

            } else {

                this._createMany( data, response, next )

            }

        } else if ( isObject( data ) ) {

            if ( isEmptyObject( data ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'objet de la requete ne peut pas être vide.` ),
                    ( this.useNext ) ? next : response
                )

            } else {

                this._createOne( data, response, next )

            }

        } else {

            TAbstractDataController.returnError(
                new UnprocessableEntityError( `Le type de donnée de la requete est invalide. Les paramètres valides sont objet ou un tableau d'objet.` ),
                ( this.useNext ) ? next : response
            )

        }

    }

    _createOne ( /*data, response, next*/ ) {}

    _createMany ( /*datas, response, next*/ ) {}

    read ( request, response, next ) {

        const id          = request.params[ 'id' ]
        const requestBody = request.body
        const haveBody    = ( isDefined( requestBody ) )
        const ids         = ( haveBody ) ? requestBody.ids : null
        const query       = ( haveBody ) ? requestBody.query : null
        const projection  = ( haveBody ) ? requestBody.projection : null

        if ( isDefined( id ) ) {

            if ( isNotString( id ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'identifiant devrait être une chaine de caractères.` ),
                    ( this.useNext ) ? next : response
                )

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'identifiant ne peut pas être une chaine de caractères vide.` ),
                    ( this.useNext ) ? next : response
                )

            } else {

                this._readOne( id, projection, response, next )

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'identifiants devrait être un tableau de chaine de caractères.` ),
                    ( this.useNext ) ? next : response
                )

            } else if ( isEmptyArray( ids ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'identifiants ne peut pas être vide.` ),
                    ( this.useNext ) ? next : response
                )

            } else {

                this._readMany( ids, projection, response, next )

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `La requete devrait être un objet javascript.` ),
                    ( this.useNext ) ? next : response
                )

            } else if ( isEmptyObject( query ) ) {

                this._readAll( projection, response, next )

            } else {

                this._readWhere( query, projection, response, next )

            }

        } else {

            TAbstractDataController.returnError(
                new UnprocessableEntityError( `La requete ne peut pas être null.` ),
                ( this.useNext ) ? next : response
            )

        }

    }

    _readOne ( /*id, projection, response, next*/ ) {}

    _readMany ( /*ids, projection, response, next*/ ) {}

    _readWhere ( /*query, projection, response, next*/ ) {}

    _readAll ( /*projection, response, next*/ ) {}

    update ( request, response, next ) {

        const id          = request.params[ 'id' ]
        const requestBody = request.body
        const haveBody    = ( isDefined( requestBody ) )
        const ids         = ( haveBody ) ? requestBody.ids : null
        const query       = ( haveBody ) ? requestBody.query : null
        const update      = ( haveBody ) ? requestBody.update : null

        if ( isNotDefined( update ) ) {

            TAbstractDataController.returnError(
                new UnprocessableEntityError( `La mise à jour a appliquer ne peut pas être null ou indefini.` ),
                ( this.useNext ) ? next : response
            )

        } else if ( isDefined( id ) ) {

            if ( isNotString( id ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'identifiant devrait être une chaine de caractères.` ),
                    ( this.useNext ) ? next : response
                )

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'identifiant ne peut pas être une chaine de caractères vide.` ),
                    ( this.useNext ) ? next : response
                )

            } else {

                this._updateOne( id, update, response, next )

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'identifiants devrait être un tableau de chaine de caractères.` ),
                    ( this.useNext ) ? next : response
                )

            } else if ( isEmptyArray( ids ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'identifiants ne peut pas être vide.` ),
                    ( this.useNext ) ? next : response
                )

            } else {

                this._updateMany( ids, update, response, next )

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `La requete devrait être un objet javascript.` ),
                    ( this.useNext ) ? next : response
                )

            } else if ( isEmptyObject( query ) ) {

                this._updateAll( update, response, next )

            } else {

                this._updateWhere( query, update, response, next )

            }

        } else {

            TAbstractDataController.returnError(
                new UnprocessableEntityError( `La requete ne peut pas être vide.` ),
                ( this.useNext ) ? next : response
            )

        }

    }

    _updateOne ( /*id, update, response, next*/ ) {}

    _updateMany ( /*ids, updates, response, next*/ ) {}

    _updateWhere ( /*query, update, response, next*/ ) {}

    _updateAll ( /*update, response, next*/ ) {}

    delete ( request, response, next ) {

        const id          = request.params[ 'id' ]
        const requestBody = request.body
        const haveBody    = ( isDefined( requestBody ) )
        const ids         = ( haveBody ) ? requestBody.ids : null
        const query       = ( haveBody ) ? requestBody.query : null

        if ( isDefined( id ) ) {

            if ( isNotString( id ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'identifiant devrait être une chaine de caractères.` ),
                    ( this.useNext ) ? next : response
                )

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'identifiant ne peut pas être une chaine de caractères vide.` ),
                    ( this.useNext ) ? next : response
                )

            } else {

                this._deleteOne( id, response, next )

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'identifiants devrait être un tableau de chaine de caractères.` ),
                    ( this.useNext ) ? next : response
                )

            } else if ( isEmptyArray( ids ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'identifiants ne peut pas être vide.` ),
                    ( this.useNext ) ? next : response
                )

            } else {

                this._deleteMany( ids, response, next )

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `La requete devrait être un objet javascript.` ),
                    ( this.useNext ) ? next : response
                )

            } else if ( isEmptyObject( query ) ) {

                this._deleteAll( response, next )

            } else {

                this._deleteWhere( query, response, next )

            }

        } else {

            TAbstractDataController.returnError(
                new UnprocessableEntityError( `La requete ne peut pas être vide.` ),
                ( this.useNext ) ? next : response
            )

        }

    }

    _deleteOne ( /*id, response, next*/ ) {}

    _deleteMany ( /*ids, response, next*/ ) {}

    _deleteWhere ( /*query, response, next*/ ) {}

    _deleteAll ( /*response, next*/ ) {}

}

export { TAbstractDataController }
