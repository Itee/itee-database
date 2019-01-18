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
          isString,
          isNotString,
          isEmptyString,
          isBlankString,
          isArray,
          isNotArray,
          isEmptyArray,
          isObject,
          isNotObject,
          isEmptyObject,
          isFunction
      } = require( 'itee-validators' )

class TAbstractDataController {

    constructor ( driver, options ) {

        this._driver  = driver
        this._options = Object.assign( {
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

            TAbstractDataController.returnError( {
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

    ////////////
    // Return //
    ////////////

    /**
     * In case database call return nothing consider that is a not found.
     * If response parameter is a function consider this is a returnNotFound callback function to call,
     * else check if server response headers aren't send yet, and return response with status 204
     *
     * @param response - The server response or returnNotFound callback
     * @returns {*} callback call or response with status 204
     */
    static returnNotFound ( response ) {

        if ( isFunction( response ) ) { return response() }
        if ( response.headersSent ) { return }

        response.status( 204 ).end()

    }

    /**
     * In case database call return an error.
     * If response parameter is a function consider this is a returnError callback function to call,
     * else check if server response headers aren't send yet, log and flush stack trace (if allowed) and return response with status 500 and
     * stringified error as content
     *
     * @param error - A server/database error
     * @param response - The server response or returnError callback
     * @returns {*} callback call or response with status 500 and associated error
     */
    static returnError ( error, response ) {

        if ( isFunction( response ) ) { return response( error, null ) }
        if ( response.headersSent ) { return }

        const formatedError = TAbstractDataController._formatError( error )

        response.format( {

            'application/json': () => {
                response.status( 500 ).json( formatedError )
            },

            'default': () => {
                response.status( 406 ).send( 'Not Acceptable' )
            }

        } )

    }

    /**
     * In case database call return some data.
     * If response parameter is a function consider this is a returnData callback function to call,
     * else check if server response headers aren't send yet, and return response with status 200 and
     * stringified data as content
     *
     * @param data - The server/database data
     * @param response - The server response or returnData callback
     * @returns {*} callback call or response with status 200 and associated data
     */
    static returnData ( data, response ) {

        if ( isFunction( response ) ) { return response( null, data ) }
        if ( response.headersSent ) { return }

        const _data = isArray( data ) ? data : [ data ]

        response.format( {

            'application/json': () => {
                response.status( 200 ).json( _data )
            },

            'default': () => {
                response.status( 406 ).send( 'Not Acceptable' )
            }

        } )

    }

    /**
     * In case database call return some data AND error.
     * If response parameter is a function consider this is a returnErrorAndData callback function to call,
     * else check if server response headers aren't send yet, log and flush stack trace (if allowed) and
     * return response with status 406 with stringified data and error in a literal object as content
     *
     * @param error - A server/database error
     * @param data - The server/database data
     * @param response - The server response or returnErrorAndData callback
     * @returns {*} callback call or response with status 406, associated error and data
     */
    static returnErrorAndData ( error, data, response ) {

        if ( isFunction( response ) ) { return response( error, data ) }
        if ( response.headersSent ) { return }

        const result = {
            errors: error,
            datas:  data
        }

        response.format( {

            'application/json': () => {
                response.status( 416 ).json( result )
            },

            'default': () => {
                response.status( 416 ).send( 'Range Not Satisfiable' )
            }

        } )

    }

    return ( response, callbacks = {} ) {

        const _callbacks = Object.assign( {

                immediate:                null,
                beforeAll:                null,
                beforeReturnErrorAndData: null,
                afterReturnErrorAndData:  null,
                beforeReturnError:        null,
                afterReturnError:         null,
                beforeReturnData:         null,
                afterReturnData:          null,
                beforeReturnNotFound:     null,
                afterReturnNotFound:      null,
                afterAll:                 null

            },
            callbacks,
            {
                returnErrorAndData: TAbstractDataController.returnErrorAndData.bind( this ),
                returnError:        TAbstractDataController.returnError.bind( this ),
                returnData:         TAbstractDataController.returnData.bind( this ),
                returnNotFound:     TAbstractDataController.returnNotFound.bind( this )
            } )

        /**
         * The callback that will be used for parse database response
         */
        function dispatchResult ( error = null, data = null ) {

            const haveData  = isDefined( data )
            const haveError = isDefined( error )

            if ( _callbacks.beforeAll ) { _callbacks.beforeAll() }

            if ( haveData && haveError ) {

                if ( _callbacks.beforeReturnErrorAndData ) { _callbacks.beforeReturnErrorAndData( error, data ) }
                _callbacks.returnErrorAndData( error, data, response )
                if ( _callbacks.afterReturnErrorAndData ) { _callbacks.afterReturnErrorAndData( error, data ) }

            } else if ( haveData && !haveError ) {

                if ( _callbacks.beforeReturnData ) { _callbacks.beforeReturnData( data ) }
                _callbacks.returnData( data, response )
                if ( _callbacks.afterReturnData ) { _callbacks.afterReturnData( data ) }

            } else if ( !haveData && haveError ) {

                if ( _callbacks.beforeReturnError ) { _callbacks.beforeReturnError( error ) }
                _callbacks.returnError( error, response )
                if ( _callbacks.afterReturnError ) { _callbacks.afterReturnError( error ) }

            } else if ( !haveData && !haveError ) {

                if ( _callbacks.beforeReturnNotFound ) { _callbacks.beforeReturnNotFound() }
                _callbacks.returnNotFound( response )
                if ( _callbacks.afterReturnNotFound ) { _callbacks.afterReturnNotFound() }

            }

            if ( _callbacks.afterAll ) { _callbacks.afterAll() }

        }

        // An immediate callback hook ( for timing for example )
        if ( _callbacks.immediate ) { _callbacks.immediate() }

        return dispatchResult

    }

    //////////////////
    // CRUD Methods //
    //////////////////

    create ( request, response, next ) {

        const data = request.body

        if ( isNotDefined( data ) ) {

            TAbstractDataController.returnError( {
                title:   'Erreur de paramètre',
                message: 'Le corps de la requete ne peut pas être null ou indefini.'
            }, (this._options.useNext) ? next : response )

        } else if ( isArray( data ) ) {

            if ( isEmptyArray( data ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'objet de la requete ne peut pas être vide.'
                }, (this._options.useNext) ? next : response )

            } else {

                this._createMany( data, response, next )

            }

        } else if ( isObject( data ) ) {

            if ( isEmptyObject( data ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'objet de la requete ne peut pas être vide.'
                }, (this._options.useNext) ? next : response )

            } else {

                this._createOne( data, response, next )

            }

        } else {

            TAbstractDataController.returnError( {
                title:   'Erreur de paramètre',
                message: 'Le type de donnée de la requete est invalide. Les paramètres valides sont objet ou un tableau d\'objet.'
            }, (this._options.useNext) ? next : response )

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

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant devrait être une chaine de caractères.'
                }, (this._options.useNext) ? next : response )

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant ne peut pas être une chaine de caractères vide.'
                }, (this._options.useNext) ? next : response )

            } else {

                this._readOne( id, projection, response, next )

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants devrait être un tableau de chaine de caractères.'
                }, (this._options.useNext) ? next : response )

            } else if ( isEmptyArray( ids ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants ne peut pas être vide.'
                }, (this._options.useNext) ? next : response )

            } else {

                this._readMany( ids, projection, response, next )

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete devrait être un objet javascript.'
                }, (this._options.useNext) ? next : response )

            } else if ( isEmptyObject( query ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete ne peut pas être vide.'
                }, (this._options.useNext) ? next : response )

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

            TAbstractDataController.returnError( {
                title:   'Erreur de paramètre',
                message: 'La mise à jour a appliquer ne peut pas être null ou indefini.'
            }, (this._options.useNext) ? next : response )

        } else if ( isDefined( id ) ) {

            if ( isNotString( id ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant devrait être une chaine de caractères.'
                }, (this._options.useNext) ? next : response )

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant ne peut pas être une chaine de caractères vide.'
                }, (this._options.useNext) ? next : response )

            } else {

                this._updateOne( id, update, response, next )

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants devrait être un tableau de chaine de caractères.'
                }, (this._options.useNext) ? next : response )

            } else if ( isEmptyArray( ids ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants ne peut pas être vide.'
                }, (this._options.useNext) ? next : response )

            } else {

                this._updateMany( ids, update, response, next )

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete devrait être un objet javascript.'
                }, (this._options.useNext) ? next : response )

            } else if ( isEmptyObject( query ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete ne peut pas être vide.'
                }, (this._options.useNext) ? next : response )

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

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant devrait être une chaine de caractères.'
                }, (this._options.useNext) ? next : response )

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant ne peut pas être une chaine de caractères vide.'
                }, (this._options.useNext) ? next : response )

            } else {

                this._deleteOne( id, response, next )

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants devrait être un tableau de chaine de caractères.'
                }, (this._options.useNext) ? next : response )

            } else if ( isEmptyArray( ids ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants ne peut pas être vide.'
                }, (this._options.useNext) ? next : response )

            } else {

                this._deleteMany( ids, response, next )

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete devrait être un objet javascript.'
                }, (this._options.useNext) ? next : response )

            } else if ( isEmptyObject( query ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete ne peut pas être vide.'
                }, (this._options.useNext) ? next : response )

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
