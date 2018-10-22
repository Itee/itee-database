/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TDatabaseController
 * @classdesc The TDatabaseController is the base class to perform CRUD operations on the database
 */

const {
          isDefined,
          isNotDefined,
          isNotString,
          isEmptyString,
          isBlankString,
          isArray,
          isNotArray,
          isEmptyArray,
          isObject,
          isNotObject,
          isEmptyObject
      } = require( 'itee-validators' )

const I = require( 'i-return' )

class TAbstractDataController {

    constructor ( driver, options ) {

        this._driver  = driver
        this._options = Object.assign({
            useNext: false
        }, options )

    }

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
                message: `${dataName} n'existe pas dans les paramètres !`
            }, response )

        }
    }

    /**
     * Normalize error that can be in different format like single string, object, array of string, or array of object.
     *
     * @example <caption>Normalized error are simple literal object like:</caption>
     * {
     *     title: 'error',
     *     message: 'the error message'
     * }
     *
     * @param {String|Object|Array.<String>|Array.<Object>} error - The error object to normalize
     * @returns {Array.<Object>}
     * @private
     */
    static _formatError ( error ) {
        let errorsList = []

        if ( isArray( error ) ) {

            for ( let i = 0, l = error.length ; i < l ; ++i ) {
                errorsList = errorsList.concat( TAbstractDataController._formatError( error[ i ] ) )
            }

        } else if ( isObject( error ) ) {

            if ( error.name === 'ValidationError' ) {

                let _message  = ''
                let subsError = error.errors

                for ( let property in subsError ) {
                    if ( !subsError.hasOwnProperty( property ) ) { continue }
                    _message += subsError[ property ].message + '<br>'
                }

                errorsList.push( {
                    title:   'Erreur de validation',
                    message: _message || 'Aucun message d\'erreur... Gloups !'
                } )

            } else if ( error.name === 'VersionError' ) {

                errorsList.push( {
                    title:   'Erreur de base de donnée',
                    message: 'Aucun document correspondant n\'as put être trouvé pour la requete !'
                } )

            } else {

                errorsList.push( {
                    title:   error.title || 'Erreur',
                    message: error.message || 'Aucun message d\'erreur... Gloups !'
                } )

            }

        } else if ( isString( error ) ) {

            errorsList.push( {
                title:   'Erreur',
                message: error
            } )

        } else {

            throw new Error( `Unknown error type: ${error} !` )

        }

        return errorsList

    }

    create ( request, response, next ) {

        const data = request.body

        if ( isNotDefined( data ) ) {

            I.returnError( {
                title:   'Erreur de paramètre',
                message: 'Le corps de la requete ne peut pas être null ou indefini.'
            }, ( this._options.useNext ) ? next : response )

        } else if ( isArray( data ) ) {

            if ( isEmptyArray( data ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'objet de la requete ne peut pas être vide.'
                }, ( this._options.useNext ) ? next : response )

            } else {

                this._createMany( data, response, next )

            }

        } else if ( isObject( data ) ) {

            if ( isEmptyObject( data ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'objet de la requete ne peut pas être vide.'
                }, ( this._options.useNext ) ? next : response )

            } else {

                this._createOne( data, response, next )

            }

        } else {

            I.returnError( {
                title:   'Erreur de paramètre',
                message: 'Le type de donnée de la requete est invalide. Les paramètres valides sont objet ou un tableau d\'objet.'
            }, ( this._options.useNext ) ? next : response )

        }

    }

    _createOne ( data, response, next ) {}

    _createMany ( datas, response, next ) {}

    read ( request, response, next ) {

        const id          = request.params[ 'id' ]
        const requestBody = request.body
        const haveBody    = (isDefined( requestBody ))
        const ids         = (haveBody) ? requestBody.ids : null
        const query       = (haveBody) ? requestBody.query : null
        const projection  = (haveBody) ? requestBody.projection : null

        if ( isDefined( id ) ) {

            if ( isNotString( id ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant devrait être une chaine de caractères.'
                }, ( this._options.useNext ) ? next : response )

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant ne peut pas être une chaine de caractères vide.'
                }, ( this._options.useNext ) ? next : response )

            } else {

                this._readOne( id, projection, response, next )

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants devrait être un tableau de chaine de caractères.'
                }, ( this._options.useNext ) ? next : response )

            } else if ( isEmptyArray( ids ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants ne peut pas être vide.'
                }, ( this._options.useNext ) ? next : response )

            } else {

                this._readMany( ids, projection, response, next )

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete devrait être un objet javascript.'
                }, ( this._options.useNext ) ? next : response )

            } else if ( isEmptyObject( query ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete ne peut pas être vide.'
                }, ( this._options.useNext ) ? next : response )

            } else {

                this._readWhere( query, projection, response, next )

            }

        } else {

            this._readAll( projection, response, next )

        }

    }

    _readOne ( id, projection, response, next ) {}

    _readMany ( ids, projection, response, next ) {}

    _readWhere ( query, projection, response, next ) {}

    _readAll ( projection, response, next ) {}

    update ( request, response, next ) {

        const id          = request.params[ 'id' ]
        const requestBody = request.body
        const haveBody    = (isDefined( requestBody ))
        const ids         = (haveBody) ? requestBody.ids : null
        const query       = (haveBody) ? requestBody.query : null
        const update      = (haveBody) ? requestBody.update : null

        if ( isNotDefined( update ) ) {

            I.returnError( {
                title:   'Erreur de paramètre',
                message: 'La mise à jour a appliquer ne peut pas être null ou indefini.'
            }, ( this._options.useNext ) ? next : response )

        } else if ( isDefined( id ) ) {

            if ( isNotString( id ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant devrait être une chaine de caractères.'
                }, ( this._options.useNext ) ? next : response )

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant ne peut pas être une chaine de caractères vide.'
                }, ( this._options.useNext ) ? next : response )

            } else {

                this._updateOne( id, update, response, next )

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants devrait être un tableau de chaine de caractères.'
                }, ( this._options.useNext ) ? next : response )

            } else if ( isEmptyArray( ids ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants ne peut pas être vide.'
                }, ( this._options.useNext ) ? next : response )

            } else {

                this._updateMany( ids, update, response, next )

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete devrait être un objet javascript.'
                }, ( this._options.useNext ) ? next : response )

            } else if ( isEmptyObject( query ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete ne peut pas être vide.'
                }, ( this._options.useNext ) ? next : response )

            } else {

                this._updateWhere( query, update, response, next )

            }

        } else {

            this._updateAll( update, response, next )

        }

    }

    _updateOne ( id, update, response, next ) {}

    _updateMany ( ids, update, response, next ) {}

    _updateWhere ( query, update, response, next ) {}

    _updateAll ( update, response, next ) {}

    delete ( request, response, next ) {

        const id          = request.params[ 'id' ]
        const requestBody = request.body
        const haveBody    = (isDefined( requestBody ))
        const ids         = (haveBody) ? requestBody.ids : null
        const query       = (haveBody) ? requestBody.query : null

        if ( isDefined( id ) ) {

            if ( isNotString( id ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant devrait être une chaine de caractères.'
                }, ( this._options.useNext ) ? next : response )

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant ne peut pas être une chaine de caractères vide.'
                }, ( this._options.useNext ) ? next : response )

            } else {

                this._deleteOne( id, response, next )

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants devrait être un tableau de chaine de caractères.'
                }, ( this._options.useNext ) ? next : response )

            } else if ( isEmptyArray( ids ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants ne peut pas être vide.'
                }, ( this._options.useNext ) ? next : response )

            } else {

                this._deleteMany( ids, response, next )

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete devrait être un objet javascript.'
                }, ( this._options.useNext ) ? next : response )

            } else if ( isEmptyObject( query ) ) {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete ne peut pas être vide.'
                }, ( this._options.useNext ) ? next : response )

            } else {

                this._deleteWhere( query, response, next )

            }

        } else {

            this._deleteAll( response, next )

        }

    }

    _deleteOne ( id, response, next ) {}

    _deleteMany ( ids, response, next ) {}

    _deleteWhere ( query, response, next ) {}

    _deleteAll ( response, next ) {}

}

module.exports = TAbstractDataController
