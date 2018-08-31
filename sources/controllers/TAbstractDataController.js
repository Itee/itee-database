/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TDatabaseController
 * @classdesc The TDatabaseController is the base class to perform CRUD operations on the database
 */

const {
          isNull, isUndefined, isNullOrUndefined, isDefined,
          isNotString, isEmptyString, isBlankString,
          isArray, isNotArray, isEmptyArray, isNotEmptyArray,
          isObject, isNotObject, isEmptyObject, isNotEmptyObject,
      } = require( 'itee-validators' )

const I = require( 'i-return' )

class TAbstractDataController {

    constructor () {}

    /**
     * Check if requested params named 'dataName' exist in request.body, request.params or request.query
     *
     * @param dataName - The property name to looking for
     * @param request - The _server request
     * @param response - The _server response
     * @returns {*} - Return the property or return error to the end user if the property doesn't exist
     * @private
     */
    static __checkData ( dataName, request, response ) {

        const body   = request.body
        const params = request.params
        const query  = request.query

        if ( isDefined( body ) && body[ dataName ] ) {

            return body[ dataName ]

        } else if ( isDefined( params ) && params[ dataName ] ) {

            return params[ dataName ]

        } else if ( isDefined( query ) && query[ dataName ] ) {

            return query[ dataName ]

        } else {

            I.returnError( {
                title:   'Erreur de paramètre',
                message: dataName + " n'existe pas dans les paramètres !"
            }, response )

        }
    }

    create ( request, response ) {

        const data = request.body
        if ( isNullOrUndefined( data ) ) {

            I.returnError( {
                title:   'Erreur de paramètre',
                message: 'Le corps de la requete ne peut pas être null ou indefini.'
            }, response )
            return

        }

        if ( isArray( data ) ) {

            if ( isEmptyArray( data ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'objet de la requete ne peut pas être vide.'
                }, response )
                return

            }

            this._createMany( data, response )

        } else if ( isObject( data ) ) {

            if ( isEmptyObject( data ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'objet de la requete ne peut pas être vide.'
                }, response )
                return

            }

            this._createOne( data, response )

        } else {

            I.returnError( {
                title:   'Erreur de paramètre',
                message: 'Le type de donnée de la requete est invalide. Les paramètres valides sont objet ou un tableau d\'objet.'
            }, response )
            return

        }

    }

    _createOne ( data, response ) {}

    _createMany ( datas, response ) {}

    read ( request, response ) {

        const id          = request.params[ 'id' ]
        const requestBody = request.body
        const haveBody    = ( isDefined( requestBody ) )
        const ids         = (haveBody) ? requestBody.ids : null
        const query       = (haveBody) ? requestBody.query : null
        const projection  = (haveBody) ? requestBody.projection : null

        if ( isDefined( id ) ) {

            if ( isNotString( id ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant devrait être une chaine de caractères.'
                }, response )

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant ne peut pas être une chaine de caractères vide.'
                }, response )

            } else {

                this._readOne( id, projection, response )

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants devrait être un tableau de chaine de caractères.'
                }, response )

            } else if ( isEmptyArray( ids ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants ne peut pas être vide.'
                }, response )

            } else {

                this._readMany( ids, projection, response )

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete devrait être un objet javascript.'
                }, response )

            } else if ( isEmptyObject( query ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete ne peut pas être vide.'
                }, response )

            } else {

                this._readWhere( query, projection, response )

            }

        } else {

            this._readAll( projection, response )

        }

    }

    _readOne ( id, projection, response ) {}

    _readMany ( ids, projection, response ) {}

    _readWhere ( query, projection, response ) {}

    _readAll ( projection, response ) {}

    update ( request, response ) {

        const id          = request.params[ 'id' ]
        const requestBody = request.body
        const haveBody    = ( isDefined( requestBody ) )
        const ids         = (haveBody) ? requestBody.ids : null
        const query       = (haveBody) ? requestBody.query : null
        const update      = (haveBody) ? requestBody.update : null

        if ( isNullOrUndefined( update ) ) {

            I.returnError( {
                title:   'Erreur de paramètre',
                message: 'La mise à jour a appliquer ne peut pas être null ou indefini.'
            }, response )
            return

        }

        if ( isDefined( id ) ) {

            if ( isNotString( id ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant devrait être une chaine de caractères.'
                }, response )

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant ne peut pas être une chaine de caractères vide.'
                }, response )

            } else {

                this._updateOne( id, update, response )

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants devrait être un tableau de chaine de caractères.'
                }, response )

            } else if ( isEmptyArray( ids ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants ne peut pas être vide.'
                }, response )

            } else {

                this._updateMany( ids, update, response )

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete devrait être un objet javascript.'
                }, response )

            } else if ( isEmptyObject( query ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete ne peut pas être vide.'
                }, response )

            } else {

                this._updateWhere( query, update, response )

            }

        } else {

            this._updateAll( update, response )

        }

    }

    _updateOne ( id, update, response ) {}

    _updateMany ( ids, update, response ) {}

    _updateWhere ( query, update, response ) {}

    _updateAll ( update, response ) {}

    delete ( request, response ) {

        const id          = request.params[ 'id' ]
        const requestBody = request.body
        const haveBody    = ( isDefined( requestBody ) )
        const ids         = (haveBody) ? requestBody.ids : null
        const query       = (haveBody) ? requestBody.query : null

        if ( isDefined( id ) ) {

            if ( isNotString( id ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant devrait être une chaine de caractères.'
                }, response )

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant ne peut pas être une chaine de caractères vide.'
                }, response )

            } else {

                this._deleteOne( id, response )

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants devrait être un tableau de chaine de caractères.'
                }, response )

            } else if ( isEmptyArray( ids ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants ne peut pas être vide.'
                }, response )

            } else {

                this._deleteMany( ids, response )

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete devrait être un objet javascript.'
                }, response )

            } else if ( isEmptyObject( query ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete ne peut pas être vide.'
                }, response )

            } else {

                this._deleteWhere( query, response )

            }

        } else {

            this._deleteAll( response )

        }

    }

    _deleteOne ( id, response ) {}

    _deleteMany ( ids, response ) {}

    _deleteWhere ( query, response ) {}

    _deleteAll ( response ) {}

}

module.exports = TAbstractDataController
