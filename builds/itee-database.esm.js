console.log('Itee.Database v7.1.0 - EsModule')
import { isDefined, isArray, isObject, isString, isFunction, isNotDefined, isEmptyArray, isEmptyObject, isNotString, isEmptyString, isBlankString, isNotArray, isNotObject, isNull, isUndefined, isInvalidDirectoryPath, isEmptyFile, isNotArrayOfString } from 'itee-validators';
import path from 'path';
import { kStringMaxLength } from 'buffer';
import fs from 'fs';
import { Writable } from 'stream';
import * as CassandraDriver from 'cassandra-driver';
import * as CoucheBaseDriver from 'couchbase';
import * as CouchDBDriver from 'nano';
import * as ElasticSearchDriver from 'elasticsearch';
import * as LevelUpDriver from 'levelup';
import { getFilesPathsUnder } from 'itee-utils';
import * as MongoDBDriver from 'mongoose';
import * as MySQLDriver from 'mysql';
import * as Neo4JDriver from 'apoc';
import * as OracleDBDriver from 'oracledb';
import PostgreSQL from 'pg-promise';
import * as RedisDriver from 'redis';
import * as SQLiteDriver from 'sqlite3';
import * as SqlServerDriver from 'tedious';
import { Connection, Request } from 'tedious';

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TDatabaseController
 * @classdesc The TDatabaseController is the base class to perform CRUD operations on the database
 */

class TAbstractDataController {

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

        const body   = request.body;
        const params = request.params;
        const query  = request.query;

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
            }, response );

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
        let errorsList = [];

        if ( isArray( error ) ) {

            for ( let i = 0, l = error.length ; i < l ; ++i ) {
                errorsList = errorsList.concat( TAbstractDataController._formatError( error[ i ] ) );
            }

        } else if ( isObject( error ) ) {

            if ( error.name === 'ValidationError' ) {

                let _message  = '';
                let subsError = error.errors;

                for ( let property in subsError ) {
                    if ( !Object.prototype.hasOwnProperty.call( subsError, property ) ) { continue }
                    _message += subsError[ property ].message + '<br>';
                }

                errorsList.push( {
                    title:   'Erreur de validation',
                    message: _message || 'Aucun message d\'erreur... Gloups !'
                } );

            } else if ( error.name === 'VersionError' ) {

                errorsList.push( {
                    title:   'Erreur de base de donnée',
                    message: 'Aucun document correspondant n\'as put être trouvé pour la requete !'
                } );

            } else {

                errorsList.push( {
                    title:   error.title || 'Erreur',
                    message: error.message || 'Aucun message d\'erreur... Gloups !'
                } );

            }

        } else if ( isString( error ) ) {

            errorsList.push( {
                title:   'Erreur',
                message: error
            } );

        } else {

            throw new Error( `Unknown error type: ${error} !` )

        }

        return errorsList

    }

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

        response.status( 204 ).end();

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

        const formatedError = TAbstractDataController._formatError( error );

        response.format( {

            'application/json': () => {
                response.status( 500 ).json( formatedError );
            },

            'default': () => {
                response.status( 406 ).send( 'Not Acceptable' );
            }

        } );

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

        const _data = isArray( data ) ? data : [ data ];

        response.format( {

            'application/json': () => {
                response.status( 200 ).json( _data );
            },

            'default': () => {
                response.status( 406 ).send( 'Not Acceptable' );
            }

        } );

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
        };

        response.format( {

            'application/json': () => {
                response.status( 416 ).json( result );
            },

            'default': () => {
                response.status( 416 ).send( 'Range Not Satisfiable' );
            }

        } );

    }

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                driver:  null,
                useNext: false
            }, ...parameters
        };

        this._driver  = _parameters.driver;
        this._useNext = _parameters.useNext;

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
            } );

        /**
         * The callback that will be used for parse database response
         */
        function dispatchResult ( error = null, data = null ) {

            const haveData  = isDefined( data );
            const haveError = isDefined( error );

            if ( _callbacks.beforeAll ) { _callbacks.beforeAll(); }

            if ( haveData && haveError ) {

                if ( _callbacks.beforeReturnErrorAndData ) { _callbacks.beforeReturnErrorAndData( error, data ); }
                _callbacks.returnErrorAndData( error, data, response );
                if ( _callbacks.afterReturnErrorAndData ) { _callbacks.afterReturnErrorAndData( error, data ); }

            } else if ( haveData && !haveError ) {

                if ( _callbacks.beforeReturnData ) { _callbacks.beforeReturnData( data ); }
                _callbacks.returnData( data, response );
                if ( _callbacks.afterReturnData ) { _callbacks.afterReturnData( data ); }

            } else if ( !haveData && haveError ) {

                if ( _callbacks.beforeReturnError ) { _callbacks.beforeReturnError( error ); }
                _callbacks.returnError( error, response );
                if ( _callbacks.afterReturnError ) { _callbacks.afterReturnError( error ); }

            } else if ( !haveData && !haveError ) {

                if ( _callbacks.beforeReturnNotFound ) { _callbacks.beforeReturnNotFound(); }
                _callbacks.returnNotFound( response );
                if ( _callbacks.afterReturnNotFound ) { _callbacks.afterReturnNotFound(); }

            }

            if ( _callbacks.afterAll ) { _callbacks.afterAll(); }

        }

        // An immediate callback hook ( for timing for example )
        if ( _callbacks.immediate ) { _callbacks.immediate(); }

        return dispatchResult

    }

    //////////////////
    // CRUD Methods //
    //////////////////

    create ( request, response, next ) {

        const data = request.body;

        if ( isNotDefined( data ) ) {

            TAbstractDataController.returnError( {
                title:   'Erreur de paramètre',
                message: 'Le corps de la requete ne peut pas être null ou indefini.'
            }, ( this._useNext ) ? next : response );

        } else if ( isArray( data ) ) {

            if ( isEmptyArray( data ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'objet de la requete ne peut pas être vide.'
                }, ( this._useNext ) ? next : response );

            } else {

                this._createMany( data, response, next );

            }

        } else if ( isObject( data ) ) {

            if ( isEmptyObject( data ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'objet de la requete ne peut pas être vide.'
                }, ( this._useNext ) ? next : response );

            } else {

                this._createOne( data, response, next );

            }

        } else {

            TAbstractDataController.returnError( {
                title:   'Erreur de paramètre',
                message: 'Le type de donnée de la requete est invalide. Les paramètres valides sont objet ou un tableau d\'objet.'
            }, ( this._useNext ) ? next : response );

        }

    }

    _createOne ( /*data, response, next*/ ) {}

    _createMany ( /*datas, response, next*/ ) {}

    read ( request, response, next ) {

        const id          = request.params[ 'id' ];
        const requestBody = request.body;
        const haveBody    = ( isDefined( requestBody ) );
        const ids         = ( haveBody ) ? requestBody.ids : null;
        const query       = ( haveBody ) ? requestBody.query : null;
        const projection  = ( haveBody ) ? requestBody.projection : null;

        if ( isDefined( id ) ) {

            if ( isNotString( id ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant devrait être une chaine de caractères.'
                }, ( this._useNext ) ? next : response );

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant ne peut pas être une chaine de caractères vide.'
                }, ( this._useNext ) ? next : response );

            } else {

                this._readOne( id, projection, response, next );

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants devrait être un tableau de chaine de caractères.'
                }, ( this._useNext ) ? next : response );

            } else if ( isEmptyArray( ids ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants ne peut pas être vide.'
                }, ( this._useNext ) ? next : response );

            } else {

                this._readMany( ids, projection, response, next );

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete devrait être un objet javascript.'
                }, ( this._useNext ) ? next : response );

            } else if ( isEmptyObject( query ) ) {

                this._readAll( projection, response, next );

            } else {

                this._readWhere( query, projection, response, next );

            }

        } else {

            TAbstractDataController.returnError( {
                title:   'Erreur de paramètre',
                message: 'La requete ne peut pas être null.'
            }, ( this._useNext ) ? next : response );

        }

    }

    _readOne ( /*id, projection, response, next*/ ) {}

    _readMany ( /*ids, projection, response, next*/ ) {}

    _readWhere ( /*query, projection, response, next*/ ) {}

    _readAll ( /*projection, response, next*/ ) {}

    update ( request, response, next ) {

        const id          = request.params[ 'id' ];
        const requestBody = request.body;
        const haveBody    = ( isDefined( requestBody ) );
        const ids         = ( haveBody ) ? requestBody.ids : null;
        const query       = ( haveBody ) ? requestBody.query : null;
        const update      = ( haveBody ) ? requestBody.update : null;

        if ( isNotDefined( update ) ) {

            TAbstractDataController.returnError( {
                title:   'Erreur de paramètre',
                message: 'La mise à jour a appliquer ne peut pas être null ou indefini.'
            }, ( this._useNext ) ? next : response );

        } else if ( isDefined( id ) ) {

            if ( isNotString( id ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant devrait être une chaine de caractères.'
                }, ( this._useNext ) ? next : response );

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant ne peut pas être une chaine de caractères vide.'
                }, ( this._useNext ) ? next : response );

            } else {

                this._updateOne( id, update, response, next );

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants devrait être un tableau de chaine de caractères.'
                }, ( this._useNext ) ? next : response );

            } else if ( isEmptyArray( ids ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants ne peut pas être vide.'
                }, ( this._useNext ) ? next : response );

            } else {

                this._updateMany( ids, update, response, next );

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete devrait être un objet javascript.'
                }, ( this._useNext ) ? next : response );

            } else if ( isEmptyObject( query ) ) {

                this._updateAll( update, response, next );

            } else {

                this._updateWhere( query, update, response, next );

            }

        } else {

            TAbstractDataController.returnError( {
                title:   'Erreur de paramètre',
                message: 'La requete ne peut pas être vide.'
            }, ( this._useNext ) ? next : response );

        }

    }

    _updateOne ( /*id, update, response, next*/ ) {}

    _updateMany ( /*ids, updates, response, next*/ ) {}

    _updateWhere ( /*query, update, response, next*/ ) {}

    _updateAll ( /*update, response, next*/ ) {}

    delete ( request, response, next ) {

        const id          = request.params[ 'id' ];
        const requestBody = request.body;
        const haveBody    = ( isDefined( requestBody ) );
        const ids         = ( haveBody ) ? requestBody.ids : null;
        const query       = ( haveBody ) ? requestBody.query : null;

        if ( isDefined( id ) ) {

            if ( isNotString( id ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant devrait être une chaine de caractères.'
                }, ( this._useNext ) ? next : response );

            } else if ( isEmptyString( id ) || isBlankString( id ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'L\'identifiant ne peut pas être une chaine de caractères vide.'
                }, ( this._useNext ) ? next : response );

            } else {

                this._deleteOne( id, response, next );

            }

        } else if ( isDefined( ids ) ) {

            if ( isNotArray( ids ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants devrait être un tableau de chaine de caractères.'
                }, ( this._useNext ) ? next : response );

            } else if ( isEmptyArray( ids ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'Le tableau d\'identifiants ne peut pas être vide.'
                }, ( this._useNext ) ? next : response );

            } else {

                this._deleteMany( ids, response, next );

            }

        } else if ( isDefined( query ) ) {

            if ( isNotObject( query ) ) {

                TAbstractDataController.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requete devrait être un objet javascript.'
                }, ( this._useNext ) ? next : response );

            } else if ( isEmptyObject( query ) ) {

                this._deleteAll( response, next );

            } else {

                this._deleteWhere( query, response, next );

            }

        } else {

            TAbstractDataController.returnError( {
                title:   'Erreur de paramètre',
                message: 'La requete ne peut pas être vide.'
            }, ( this._useNext ) ? next : response );

        }

    }

    _deleteOne ( /*id, response, next*/ ) {}

    _deleteMany ( /*ids, response, next*/ ) {}

    _deleteWhere ( /*query, response, next*/ ) {}

    _deleteAll ( /*response, next*/ ) {}

}

/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TAbstractDataConverter {

    constructor () {

        this._isProcessing = false;
        this._queue        = [];

    }

    convert ( file, parameters, onSuccess, onProgress, onError ) {

        this._queue.push( {
            file,
            parameters,
            onSuccess,
            onProgress,
            onError
        } );

        if ( !this._isProcessing ) {
            this._processQueue();
        }

    }

    _processQueue () {

        if ( this._queue.length === 0 ) {

            this._isProcessing = false;
            return

        }

        this._isProcessing = true;

        const self       = this;
        const dataBloc   = this._queue.shift();
        const data       = dataBloc.file;
        const parameters = dataBloc.parameters;
        const onSuccess  = dataBloc.onSuccess;
        const onProgress = dataBloc.onProgress;
        const onError    = dataBloc.onError;

        self._convert(
            data,
            parameters,
            _onSaveSuccess,
            _onSaveProgress,
            _onSaveError
        );

        function _onSaveSuccess ( result ) {

            onSuccess( result );
            self._processQueue();

        }

        function _onSaveProgress ( progress ) {

            onProgress( progress );

        }

        function _onSaveError ( error ) {

            onError( error );
            self._processQueue();

        }

    }

    _convert ( /*data, parameters, onSuccess, onProgress, onError*/ ) {}

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

// Todo: Extend sort of Factory
class TAbstractConverterManager {

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
        let errorsList = [];

        if ( isArray( error ) ) {

            for ( let i = 0, l = error.length ; i < l ; ++i ) {
                errorsList = errorsList.concat( TAbstractConverterManager._formatError( error[ i ] ) );
            }

        } else if ( isObject( error ) ) {

            if ( error.name === 'ValidationError' ) {

                let _message  = '';
                let subsError = error.errors;

                for ( let property in subsError ) {
                    if ( !Object.prototype.hasOwnProperty.call( subsError, property ) ) { continue }
                    _message += subsError[ property ].message + '<br>';
                }

                errorsList.push( {
                    title:   'Erreur de validation',
                    message: _message || 'Aucun message d\'erreur... Gloups !'
                } );

            } else if ( error.name === 'VersionError' ) {

                errorsList.push( {
                    title:   'Erreur de base de donnée',
                    message: 'Aucun document correspondant n\'as put être trouvé pour la requete !'
                } );

            } else {

                errorsList.push( {
                    title:   error.title || 'Erreur',
                    message: error.message || 'Aucun message d\'erreur... Gloups !'
                } );

            }

        } else if ( isString( error ) ) {

            errorsList.push( {
                title:   'Erreur',
                message: error
            } );

        } else {

            throw new Error( `Unknown error type: ${error} !` )

        }

        return errorsList

    }

    static _convertFilesObjectToArray ( files ) {

        const fileArray = [];

        for ( let field in files ) {

            if ( Object.prototype.hasOwnProperty.call( files, field ) ) {

                fileArray.push( files[ field ] );

            }

        }

        return fileArray

    }

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

        response.status( 204 ).end();

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

        const formatedError = TAbstractConverterManager._formatError( error );

        response.format( {

            'application/json': () => {
                response.status( 500 ).json( formatedError );
            },

            'default': () => {
                response.status( 406 ).send( 'Not Acceptable' );
            }

        } );

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

        const _data = isArray( data ) ? data : [ data ];

        response.format( {

            'application/json': () => {
                response.status( 200 ).json( _data );
            },

            'default': () => {
                response.status( 406 ).send( 'Not Acceptable' );
            }

        } );

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
        };

        response.format( {

            'application/json': () => {
                response.status( 416 ).json( result );
            },

            'default': () => {
                response.status( 416 ).send( 'Range Not Satisfiable' );
            }

        } );

    }

    static return ( response, callbacks = {} ) {

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
                returnErrorAndData: TAbstractConverterManager.returnErrorAndData.bind( this ),
                returnError:        TAbstractConverterManager.returnError.bind( this ),
                returnData:         TAbstractConverterManager.returnData.bind( this ),
                returnNotFound:     TAbstractConverterManager.returnNotFound.bind( this )
            } );

        /**
         * The callback that will be used for parse database response
         */
        function dispatchResult ( error = null, data = null ) {

            const haveData  = isDefined( data );
            const haveError = isDefined( error );

            if ( _callbacks.beforeAll ) { _callbacks.beforeAll(); }

            if ( haveData && haveError ) {

                if ( _callbacks.beforeReturnErrorAndData ) { _callbacks.beforeReturnErrorAndData( error, data ); }
                _callbacks.returnErrorAndData( error, data, response );
                if ( _callbacks.afterReturnErrorAndData ) { _callbacks.afterReturnErrorAndData( error, data ); }

            } else if ( haveData && !haveError ) {

                if ( _callbacks.beforeReturnData ) { _callbacks.beforeReturnData( data ); }
                _callbacks.returnData( data, response );
                if ( _callbacks.afterReturnData ) { _callbacks.afterReturnData( data ); }

            } else if ( !haveData && haveError ) {

                if ( _callbacks.beforeReturnError ) { _callbacks.beforeReturnError( error ); }
                _callbacks.returnError( error, response );
                if ( _callbacks.afterReturnError ) { _callbacks.afterReturnError( error ); }

            } else if ( !haveData && !haveError ) {

                if ( _callbacks.beforeReturnNotFound ) { _callbacks.beforeReturnNotFound(); }
                _callbacks.returnNotFound( response );
                if ( _callbacks.afterReturnNotFound ) { _callbacks.afterReturnNotFound(); }

            }

            if ( _callbacks.afterAll ) { _callbacks.afterAll(); }

        }

        // An immediate callback hook ( for timing for example )
        if ( _callbacks.immediate ) { _callbacks.immediate(); }

        return dispatchResult

    }

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                driver:            null,
                useNext:           false,
                converters:        new Map(),
                convertersOptions: undefined,
                rules:             {},
                inserter:          {}
            }, ...parameters
        };

        this._driver            = _parameters.driver;
        this._useNext           = _parameters.useNext;
        this._converters        = _parameters.converters;
        this._convertersOptions = _parameters.convertersOptions;
        this._rules             = _parameters.rules;
        this._inserter          = new _parameters.inserter( this._driver );

        this._errors         = [];
        this._processedFiles = [];

    }

    _fileConversionSuccessCallback ( response, next, extraSuccessCallback, data ) {

        if ( extraSuccessCallback ) {
            extraSuccessCallback( data );
            return
        }

        this._inserter.save(
            data,
            this._convertersOptions,
            this._fileInsertionSuccessCallback.bind( this, response, next ),
            this._fileConversionProgressCallback.bind( this, response ),
            this._fileConversionErrorCallback.bind( this, response, next )
        );

    }

    _fileInsertionSuccessCallback ( response, next, data ) {

        this._checkEndOfReturns( response, next, data );

    }

    _fileConversionProgressCallback ( response, progress ) {

        console.log( progress );

    }

    _fileConversionErrorCallback ( response, next, error ) {

        this._errors.push( error );
        this._checkEndOfReturns( response, next, null );

    }

    _checkEndOfReturns ( response, next, data ) {

        if ( this._errors.length > 0 ) {

            if ( this._useNext ) {
                next( this._errors );
            } else {
                TAbstractConverterManager.return( response )( this._errors );
                this._errors = [];
            }

        } else {
            if ( this._useNext ) {
                next();
            } else {
                TAbstractConverterManager.returnData( data, response );
            }
        }

    }

    processFiles ( request, response, next ) {

        const files             = TAbstractConverterManager._convertFilesObjectToArray( request.files );
        const numberOfFiles     = files.length;
        this._convertersOptions = request.body;

        for ( let fileIndex = 0 ; fileIndex < numberOfFiles ; fileIndex++ ) {
            let file = files[ fileIndex ];
            if ( this._processedFiles.includes( file.filename ) ) { return }
            this._processedFiles.push( file.filename );
        }

        if ( numberOfFiles === 0 ) {

            if ( this._useNext ) {
                next( `Impossible d'analyser ${numberOfFiles} fichiers associatifs simultanément !` );
            } else {
                TAbstractConverterManager.returnError( `Impossible d'analyser ${numberOfFiles} fichiers associatifs simultanément !`, response );
            }

        }

        this._processFiles( files, this._convertersOptions, response, next );

    }

    _processFiles ( files, parameters, response, next ) {

        const fileExtensions = files.map( ( file ) => path.extname( file.filename ) );
        const matchingRules  = this._rules.filter( elem => {

            const availables = elem.on;

            if ( Array.isArray( availables ) ) {

                for ( var i = 0 ; i < availables.length ; i++ ) {
                    if ( !fileExtensions.includes( availables[ i ] ) ) {
                        return false
                    }
                }
                return true

            } else {
                return fileExtensions.includes( availables )
            }

        } );

        for ( let ruleIndex = 0, numberOfRules = matchingRules.length ; ruleIndex < numberOfRules ; ruleIndex++ ) {
            let converterNames = matchingRules[ ruleIndex ].use;

            if ( Array.isArray( converterNames ) ) {

                let previousOnSucess = undefined;
                for ( let converterIndex = converterNames.length - 1 ; converterIndex >= 0 ; converterIndex-- ) {
                    const converterName = converterNames[ converterIndex ];

                    if ( converterIndex === 0 ) {

                        this._converters[ converterName ].convert(
                            files,
                            parameters,
                            this._fileConversionSuccessCallback.bind( this, response, next, previousOnSucess ),
                            this._fileConversionProgressCallback.bind( this, response ),
                            this._fileConversionErrorCallback.bind( this, response, next )
                        );

                    } else if ( converterIndex === converterNames.length - 1 ) {

                        previousOnSucess = ( previousResult ) => {

                            this._converters[ converterName ].convert(
                                previousResult,
                                parameters,
                                this._fileConversionSuccessCallback.bind( this, response, next, null ),
                                this._fileConversionProgressCallback.bind( this, response ),
                                this._fileConversionErrorCallback.bind( this, response, next )
                            );

                        };

                    } else {

                        previousOnSucess = ( previousResult ) => {

                            this._converters[ converterName ].convert(
                                previousResult,
                                parameters,
                                this._fileConversionSuccessCallback.bind( this, response, next, previousOnSucess ),
                                this._fileConversionProgressCallback.bind( this, response ),
                                this._fileConversionErrorCallback.bind( this, response, next )
                            );

                        };

                    }

                }

            } else {

                this._converters[ converterNames ].convert(
                    files[ 0 ].file,
                    parameters,
                    this._fileConversionSuccessCallback.bind( this, response, next, null ),
                    this._fileConversionProgressCallback.bind( this, response ),
                    this._fileConversionErrorCallback.bind( this, response, next )
                );

            }

        }

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

    // Todo: Extend from TDataQueueProcessor
class TAbstractDataInserter {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                driver: null
            }, ...parameters
        };

        this._driver = _parameters.driver;

        this._isProcessing = false;
        this._queue        = [];

    }

    save ( data, parameters, onSuccess, onProgress, onError ) {

        if ( !data ) {
            onError( 'Data cannot be null or empty, aborting database insert !!!' );
            return
        }

        if ( !parameters ) {
            onError( 'Invalid parent id, unable to set children to unknown database node !!!' );
            return
        }

        this._queue.push( {
            data,
            parameters,
            onSuccess,
            onProgress,
            onError
        } );

        this._processQueue();

    }

    _processQueue () {

        if ( this._queue.length === 0 || this._isProcessing ) { return }

        this._isProcessing = true;

        const self       = this;
        const dataBloc   = this._queue.shift();
        const data       = dataBloc.data;
        const parameters = dataBloc.parameters;
        const onSuccess  = dataBloc.onSuccess;
        const onProgress = dataBloc.onProgress;
        const onError    = dataBloc.onError;

        self._save(
            data,
            parameters,
            _onSaveSuccess,
            _onSaveProgress,
            _onSaveError
        );

        function _onSaveSuccess ( result ) {

            onSuccess( result );

            self._isProcessing = false;
            self._processQueue();

        }

        function _onSaveProgress ( progress ) {

            onProgress( progress );

        }

        function _onSaveError ( error ) {

            onError( error );

            self._isProcessing = false;
            self._processQueue();

        }

    }

    _save ( /*data, parameters, onSuccess, onProgress, onError*/ ) {}

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

/* Writable memory stream */
class MemoryWriteStream extends Writable {

    constructor ( options ) {

        super( options );

        const bufferSize  = options.bufferSize || kStringMaxLength;
        this.memoryBuffer = Buffer.alloc( bufferSize );
        this.offset       = 0;
    }

    toString () {

        const string = this.memoryBuffer.toString();
        this._releaseMemory();

        return string

    }

    _final ( callback ) {

        callback();

    }

    _write ( chunk, encoding, callback ) {

        // our memory store stores things in buffers
        const buffer = ( Buffer.isBuffer( chunk ) ) ? chunk : new Buffer( chunk, encoding );

        // concat to the buffer already there
        for ( let byteIndex = 0, numberOfByte = buffer.length ; byteIndex < numberOfByte ; byteIndex++ ) {
            this.memoryBuffer[ this.offset ] = buffer[ byteIndex ];
            this.offset++;
        }

        // Next
        callback();

    }

    _writev ( chunks, callback ) {

        for ( let chunkIndex = 0, numberOfChunks = chunks.length ; chunkIndex < numberOfChunks ; chunkIndex++ ) {
            this.memoryBuffer = Buffer.concat( [ this.memoryBuffer, chunks[ chunkIndex ] ] );
        }

        // Next
        callback();

    }

    ////

    _releaseMemory () {

        this.memoryBuffer = null;

    }

    toArrayBuffer () {

        const buffer      = this.memoryBuffer;
        const arrayBuffer = new ArrayBuffer( buffer.length );
        const view        = new Uint8Array( arrayBuffer );

        for ( let i = 0 ; i < buffer.length ; ++i ) {
            view[ i ] = buffer[ i ];
        }

        this._releaseMemory();

        return arrayBuffer

    }

    toJSON () {

        return JSON.parse( this.toString() )

    }

}

////////

class TAbstractFileConverter {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                dumpType: TAbstractFileConverter.DumpType.ArrayBuffer
            }, ...parameters
        };

        this.dumpType = _parameters.dumpType;

        this._isProcessing = false;
        this._queue        = [];

    }

    get dumpType () {

        return this._dumpType

    }

    set dumpType ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Dump type cannot be null ! Expect a non empty string.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Dump type cannot be undefined ! Expect a non empty string.' ) }

        this._dumpType = value;

    }

    setDumpType ( value ) {

        this.dumpType = value;
        return this

    }

    convert ( file, parameters, onSuccess, onProgress, onError ) {

        if ( !file ) {
            onError( 'File cannot be null or empty, aborting file convertion !!!' );
            return
        }

        this._queue.push( {
            file,
            parameters,
            onSuccess,
            onProgress,
            onError
        } );

        this._processQueue();

    }

    _processQueue () {

        if ( this._queue.length === 0 || this._isProcessing ) { return }

        this._isProcessing = true;

        const self       = this;
        const dataBloc   = this._queue.shift();
        const data       = dataBloc.file;
        const parameters = dataBloc.parameters;
        const onSuccess  = dataBloc.onSuccess;
        const onProgress = dataBloc.onProgress;
        const onError    = dataBloc.onError;

        self._dumpFileInMemoryAs(
            self._dumpType,
            data,
            parameters,
            _onDumpSuccess,
            _onProcessProgress,
            _onProcessError
        );

        function _onDumpSuccess ( data ) {

            self._convert(
                data,
                parameters,
                _onProcessSuccess,
                _onProcessProgress,
                _onProcessError
            );

        }

        function _onProcessSuccess ( threeData ) {

            onSuccess( threeData );

            self._isProcessing = false;
            self._processQueue();

        }

        function _onProcessProgress ( progress ) {

            onProgress( progress );

        }

        function _onProcessError ( error ) {

            onError( error );

            self._isProcessing = false;
            self._processQueue();

        }

    }

    _dumpFileInMemoryAs ( dumpType, file, parameters, onSuccess, onProgress, onError ) {

        let isOnError = false;

        const fileReadStream = fs.createReadStream( file );

        fileReadStream.on( 'error', ( error ) => {
            console.error( `Read stream on error: ${error}` );

            isOnError = true;
            onError( error );

        } );

        const fileSize          = parseInt( parameters.fileSize );
        const memoryWriteStream = new MemoryWriteStream( { bufferSize: fileSize } );

        memoryWriteStream.on( 'error', ( error ) => {

            isOnError = true;
            onError( error );

        } );

        memoryWriteStream.on( 'finish', () => {

            if ( isOnError ) {
                return
            }

            switch ( dumpType ) {

                case TAbstractFileConverter.DumpType.ArrayBuffer:
                    onSuccess( memoryWriteStream.toArrayBuffer() );
                    break

                case TAbstractFileConverter.DumpType.String:
                    onSuccess( memoryWriteStream.toString() );
                    break

                case TAbstractFileConverter.DumpType.JSON:
                    onSuccess( memoryWriteStream.toJSON() );
                    break

                default:
                    throw new RangeError( `Invalid switch parameter: ${dumpType}` )

            }

            fileReadStream.unpipe();
            fileReadStream.close();
            memoryWriteStream.end();

        } );

        fileReadStream.pipe( memoryWriteStream );

    }

    _convert ( /*data, parameters, onSuccess, onProgress, onError*/ ) {}

}

TAbstractFileConverter.MAX_FILE_SIZE = 67108864;

TAbstractFileConverter.DumpType = Object.freeze( {
    ArrayBuffer: 0,
    String:      1,
    JSON:        2
} );

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TAbstractDatabasePlugin {

    static _registerRoutesTo ( Driver, Application, Router, ControllerCtors, descriptors ) {

        for ( let index = 0, numberOfDescriptor = descriptors.length ; index < numberOfDescriptor ; index++ ) {

            const descriptor      = descriptors[ index ];
            const ControllerClass = ControllerCtors.get( descriptor.controller.name );
            const controller      = new ControllerClass( { driver: Driver, ...descriptor.controller.options } );
            const router          = Router( { mergeParams: true } );

            console.log( `\tAdd controller for base route: ${descriptor.route}` );
            Application.use( descriptor.route, TAbstractDatabasePlugin._populateRouter( router, controller, descriptor.controller.can ) );

        }

    }

    static _populateRouter ( router, controller, can = {} ) {

        for ( let _do in can ) {

            const action = can[ _do ];

            console.log( `\t\tMap route ${action.over} on (${action.on}) to ${controller.constructor.name}.${_do} method.` );
            router[ action.on ]( action.over, controller[ _do ].bind( controller ) );

        }

        return router

    }

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                controllers: new Map(),
                descriptors: []
            }, ...parameters
        };

        this.controllers = _parameters.controllers;
        this.descriptors = _parameters.descriptors;

        this.__dirname = undefined;

    }

    get controllers () {
        return this._controllers
    }

    set controllers ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Controllers cannot be null ! Expect a map of controller.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Controllers cannot be undefined ! Expect a map of controller.' ) }
        if ( !( value instanceof Map ) ) { throw new TypeError( `Controllers cannot be an instance of ${value.constructor.name} ! Expect a map of controller.` ) }

        this._controllers = value;

    }

    get descriptors () {
        return this._descriptors
    }

    set descriptors ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Descriptors cannot be null ! Expect an array of POJO.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Descriptors cannot be undefined ! Expect an array of POJO.' ) }

        this._descriptors = value;

    }

    addController ( value ) {

        this._controllers.set( value.name, value );
        return this

    }

    addDescriptor ( value ) {

        this._descriptors.push( value );
        return this

    }

    beforeRegisterRoutes ( /*driver*/ ) {}

    registerTo ( driver, application, router ) {

        this.beforeRegisterRoutes( driver );

        TAbstractDatabasePlugin._registerRoutesTo( driver, application, router, this._controllers, this._descriptors );

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                driver:      null,
                application: null,
                router:      null,
                plugins:     []
            }, ...parameters
        };

        this.driver      = _parameters.driver;
        this.application = _parameters.application;
        this.router      = _parameters.router;
        this.plugins     = _parameters.plugins;

        this.init();

        this._registerPlugins();

    }

    get plugins () {

        return this._plugins

    }

    set plugins ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Plugins cannot be null ! Expect an array of TDatabasePlugin.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Plugins cannot be undefined ! Expect an array of TDatabasePlugin.' ) }

        this._plugins = value;

    }

    get router () {

        return this._router

    }

    set router ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Router cannot be null ! Expect a Express Router.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Router cannot be undefined ! Expect a Express Router.' ) }

        this._router = value;

    }

    get application () {

        return this._application

    }

    set application ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Application cannot be null ! Expect a Express Application.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Application cannot be undefined ! Expect a Express Application.' ) }

        this._application = value;

    }

    get driver () {

        return this._driver

    }

    set driver ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Driver cannot be null ! Expect a database driver.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Driver cannot be undefined ! Expect a database driver.' ) }

        this._driver = value;

    }

    setPlugins ( value ) {

        this.plugins = value;
        return this

    }

    setRouter ( value ) {

        this.router = value;
        return this

    }

    setApplication ( value ) {

        this.application = value;
        return this

    }

    setDriver ( value ) {

        this.driver = value;
        return this

    }

    init () {}

    _registerPlugins () {

        for ( let [ name, config ] of Object.entries( this._plugins ) ) {

            if ( this._registerPackagePlugin( name, config ) ) {

                console.log( `Use ${name} plugin from node_modules` );

            } else if ( this._registerLocalPlugin( name, config ) ) {

                console.log( `Use ${name} plugin from local folder` );

            } else {

                console.error( `Unable to register the plugin ${name} the package or local folder doesn't seem to exist ! Skip it.` );

            }

        }

    }

    _registerPackagePlugin ( name ) {

        let success = false;

        try {

            const plugin = require( name );
            if ( plugin instanceof TAbstractDatabasePlugin ) {

                plugin.__dirname = path.dirname( require.resolve( name ) );
                plugin.registerTo( this._driver, this._application, this._router );

                success = true;

            } else {

                console.error( `The plugin ${name} doesn't seem to be an instance of an extended class from TAbstractDatabasePlugin ! Skip it.` );

            }

        } catch ( error ) {

            if ( !error.code || error.code !== 'MODULE_NOT_FOUND' ) {

                console.error( error );

            }

        }

        return success

    }

    _registerLocalPlugin ( name, path ) {

        let success = false;

        try {

            // todo use rootPath or need to resolve depth correctly !
            const localPluginPath = path.join( __dirname, '../../../', 'databases/plugins/', name, name + '.js' );
            const plugin          = require( localPluginPath );

            if ( plugin instanceof TAbstractDatabasePlugin ) {

                plugin.__dirname = path.dirname( require.resolve( localPluginPath ) );
                plugin.registerTo( this._driver, this._application, this._router );

                success = true;

            } else {

                console.error( `The plugin ${name} doesn't seem to be an instance of an extended class from TAbstractDatabasePlugin ! Skip it.` );

            }

        } catch ( error ) {

            console.error( error );

        }

        return success

    }

    connect () {}

    close ( /*callback*/ ) {}

    on ( /*eventName, callback*/ ) {}

}

/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TCassandraDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: CassandraDriver
            }
        };

        super( _parameters );

    }

    close ( /*onCloseCallback*/ ) {}

    connect () {

        const client = new this._driver.Client( { contactPoints: [ 'localhost' ] } );

        client.execute( 'select key from system.local', function ( err, result ) {
            if ( err ) {
                throw err
            }
            console.log( result.rows[ 0 ] );
        } );

    }

    init () {
        super.init();

    }

    on ( /*eventName, callback*/ ) {}

}

/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TCouchBaseDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: CoucheBaseDriver
            }
        };

        super( _parameters );

    }

    close ( /*onCloseCallback*/ ) {}

    connect () {

        var bucket = ( new this._driver.Cluster( 'http://localhost:8091' ) ).openBucket( 'bucketName' );

        // add a document to a bucket
        bucket.insert(
            'document-key',
            {
                name:     'Matt',
                shoeSize: 13
            },
            function ( err, result ) {
                if ( err ) {
                    console.log( err );
                } else {
                    console.log( result );
                }
            } );

        // get all documents with shoe size 13
        var n1ql  = 'SELECT d.* FROM `bucketName` d WHERE shoeSize = $1';
        var query = this.driver.N1qlQuery.fromString( n1ql );
        bucket.query( query, [ 13 ], function ( err, result ) {
            if ( err ) {
                console.log( err );
            } else {
                console.log( result );
            }
        } );

    }

    init () {
        super.init();

    }

    on ( /*eventName, callback*/ ) {}
}

/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TCouchDBDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: CouchDBDriver
            }
        };

        super( _parameters );

    }

    close ( /*onCloseCallback*/ ) {}

    connect () {

        var nano = this._driver( 'http://localhost:5984' );
        nano.db.create( 'books' );
        var books = nano.db.use( 'books' );

        // Insert a book document in the books database
        books.insert( { name: 'The Art of war' }, null, function ( err, body ) {
            if ( err ) {
                console.log( err );
            } else {
                console.log( body );
            }
        } );

        // Get a list of all books
        books.list( function ( err, body ) {
            if ( err ) {
                console.log( err );
            } else {
                console.log( body.rows );
            }
        } );

    }

    init () {
        super.init();

    }

    on ( /*eventName, callback*/ ) {}
}

/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TElasticSearchDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: ElasticSearchDriver
            }
        };

        super( _parameters );

    }

    close ( /*onCloseCallback*/ ) {}

    connect () {

        var client = this._driver.Client( {
            host: 'localhost:9200'
        } );

        client.search( {
            index: 'books',
            type:  'book',
            body:  {
                query: {
                    multi_match: {
                        query:  'express js',
                        fields: [ 'title', 'description' ]
                    }
                }
            }
        } ).then( function ( response ) {
            var hits = response.hits.hits;
            console.log( hits );
        }, function ( error ) {
            console.trace( error.message );
        } );

    }

    init () {
        super.init();

    }

    on ( /*eventName, callback*/ ) {}
}

/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TLevelDBDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: LevelUpDriver
            }
        };

        super( _parameters );

    }

    close ( /*onCloseCallback*/ ) {}

    connect () {

        var db = this._driver( './mydb' );

        db.put( 'name', 'LevelUP', function ( err ) {
            if ( err ) {
                return console.log( 'Ooops!', err )
            }

            db.get( 'name', function ( err, value ) {
                if ( err ) {
                    return console.log( 'Ooops!', err )
                }

                console.log( 'name=' + value );
            } );
        } );

    }

    init () {
        super.init();

    }

    on ( /*eventName, callback*/ ) {}

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TMongooseController
 * @classdesc The TMongooseController is the base class to perform CRUD operations on the database
 */

class TMongooseController extends TAbstractDataController {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                driver:     null,
                schemaName: ''
            }, ...parameters
        };

        super( _parameters );

        this.databaseSchema = this._driver.model( _parameters.schemaName );

    }

    get databaseSchema () {

        return this._databaseSchema

    }

    set databaseSchema ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Database schema cannot be null.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Database schema cannot be undefined.' ) }

        this._databaseSchema = value;

    }

    setDatabaseSchema ( value ) {

        this.databaseSchema = value;
        return this

    }

    _createMany ( datas, response ) {
        super._createMany( datas, response );

        this._databaseSchema.create( datas, this.return( response ) );

    }

    // Create
    _createOne ( data, response ) {
        super._createOne( data, response );

        this._databaseSchema.create( data, this.return( response ) );

    }

    _deleteAll ( response ) {
        super._deleteAll( response );

        this._databaseSchema.collection.drop( this.return( response ) );

    }

    _deleteMany ( ids, response ) {
        super._deleteMany( ids, response );

        this._databaseSchema.deleteMany( { '_id': { $in: ids } }, this.return( response ) );

    }

    // Delete
    _deleteOne ( id, response ) {
        super._deleteOne( id, response );

        this._databaseSchema
            .findByIdAndDelete( id )
            .then( data => TAbstractDataController.returnData( data, response ) )
            .catch( error => TAbstractDataController.returnError( error, response ) );

    }

    _deleteWhere ( query, response ) {
        super._deleteWhere( query, response );

        this._databaseSchema.deleteMany( query, this.return( response ) );

    }

    _readAll ( projection, response ) {
        super._readAll( projection, response );

        this._databaseSchema
            .find( {}, projection )
            .lean()
            .exec()
            .then( data => TAbstractDataController.returnData( data, response ) )
            .catch( error => TAbstractDataController.returnError( error, response ) );

    }

    _readMany ( ids, projection, response ) {
        super._readMany( ids, projection, response );

        this._databaseSchema
            .find( { '_id': { $in: ids } }, projection )
            .lean()
            .exec()
            .then( ( data ) => {

                if ( isNull( data ) || isEmptyArray( data ) ) {
                    TAbstractDataController.returnNotFound( response );
                } else if ( ids.length !== data.length ) {
                    TAbstractDataController.returnErrorAndData( {
                        title:   'Missing data',
                        message: 'Some requested objects could not be found.'
                    }, data, response );
                } else {
                    TAbstractDataController.returnData( data, response );
                }

            } )
            .catch( error => TAbstractDataController.returnError( error, response ) );

    }

    // Read
    _readOne ( id, projection, response ) {
        super._readOne( id, projection, response );

        this._databaseSchema
            .findById( id, projection )
            .lean()
            .exec()
            .then( ( data ) => {

                if ( isNull( data ) ) {
                    TAbstractDataController.returnNotFound( response );
                } else {
                    TAbstractDataController.returnData( data, response );
                }

            } )
            .catch( error => TAbstractDataController.returnError( error, response ) );

    }

    _readWhere ( query, projection, response ) {
        super._readWhere( query, projection, response );

        this._databaseSchema
            .find( query, projection )
            .lean()
            .exec()
            .then( data => TAbstractDataController.returnData( data, response ) )
            .catch( error => TAbstractDataController.returnError( error, response ) );

    }

    _updateAll ( update, response ) {
        super._updateAll( update, response );

        this._databaseSchema.update( {}, update, { multi: true }, this.return( response ) );

    }

    _updateMany ( ids, updates, response ) {
        super._updateMany( ids, updates, response );

        this._databaseSchema.update( { _id: { $in: ids } }, updates, { multi: true }, this.return( response ) );

    }

    // Update
    _updateOne ( id, update, response ) {
        super._updateOne( id, update, response );

        this._databaseSchema
            .findByIdAndUpdate( id, update )
            .exec()
            .then( data => TAbstractDataController.returnData( data, response ) )
            .catch( error => TAbstractDataController.returnError( error, response ) );

    }

    _updateWhere ( query, update, response ) {
        super._updateWhere( query, update, response );

        this._databaseSchema.update( query, update, { multi: true }, this.return( response ) );

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TMongoDBPlugin extends TAbstractDatabasePlugin {

    get schemas () {
        return this._schemas
    }

    set schemas ( value ) {
        this._schemas = value;
    }

    get types () {
        return this._types
    }

    set types ( value ) {
        this._types = value;
    }

    addType ( value ) {

        this._types.push( value );
        return this

    }

    static _registerTypesTo ( Mongoose, dirname ) {

        const typesBasePath = path.join( dirname, 'types' );
        if ( isInvalidDirectoryPath( typesBasePath ) ) {
            console.warn( `Unable to find "types" folder for path "${typesBasePath}"` );
            return
        }

        const typesFilesPaths = getFilesPathsUnder( typesBasePath );
        let typeFilePath      = '';
        let typeFile          = undefined;

        for ( let typeIndex = 0, numberOfTypes = typesFilesPaths.length ; typeIndex < numberOfTypes ; typeIndex++ ) {

            typeFilePath = typesFilesPaths[ typeIndex ];

            if ( isEmptyFile( typeFilePath, 200 ) ) {

                console.warn( `Skip empty core database schema: ${typeFilePath}` );
                continue

            }

            typeFile = require( typeFilePath );

            if ( isFunction( typeFile ) ) {

                console.log( `Register type: ${typeFilePath}` );
                typeFile( Mongoose );

            } else {

                console.error( `Unable to register type: ${typeFilePath}` );

            }

        }

    }

    static _registerSchemasTo ( Mongoose, dirname ) {

        const localSchemasBasePath = path.join( dirname, 'schemas' );
        if ( isInvalidDirectoryPath( localSchemasBasePath ) ) {
            console.warn( `Unable to find "schemas" folder for path "${localSchemasBasePath}"` );
            return
        }

        const localSchemasFilesPaths = getFilesPathsUnder( localSchemasBasePath );
        let localSchemaFilePath      = '';
        let localSchemaFile          = undefined;
        for ( let schemaIndex = 0, numberOfSchemas = localSchemasFilesPaths.length ; schemaIndex < numberOfSchemas ; schemaIndex++ ) {

            localSchemaFilePath = localSchemasFilesPaths[ schemaIndex ];

            if ( isEmptyFile( localSchemaFilePath ) ) {

                console.warn( `Skip empty local database schema: ${localSchemaFilePath}` );
                continue

            }

            localSchemaFile = require( localSchemaFilePath );

            if ( isFunction( localSchemaFile ) ) {

                console.log( `Direct register local database schema: ${localSchemaFilePath}` );
                localSchemaFile( Mongoose );

            } else if ( isFunction( localSchemaFile.registerModelTo ) ) {

                console.log( `Register local database schema: ${localSchemaFilePath}` );
                localSchemaFile.registerModelTo( Mongoose );

            } else {

                console.error( `Unable to register local database schema: ${localSchemaFilePath}` );

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
        };

        super( _parameters );

        this.types   = _parameters.types;
        this.schemas = _parameters.schemas;

    }

    beforeRegisterRoutes ( Mongoose ) {
        super.beforeRegisterRoutes( Mongoose );

        this._registerTypes( Mongoose );
        TMongoDBPlugin._registerTypesTo( Mongoose, this.__dirname );
        TMongoDBPlugin._registerSchemasTo( Mongoose, this.__dirname );

    }

    _registerTypes ( Mongoose ) {

        for ( let typeWrapper of this._types ) {

            console.log( `Register type: ${typeWrapper.name}` );
            typeWrapper( Mongoose );

        }

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TMongoDBDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                databaseUrl: ''
            },
            ...parameters,
            ...{
                driver: MongoDBDriver
            }
        };

        super( _parameters );

        this.databaseUrl = _parameters.databaseUrl;

    }

    close ( onCloseCallback ) {

        this._driver.connection.close( onCloseCallback );

    }

    connect () {

        this._driver.connect( this.databaseUrl, { useNewUrlParser: true } )
            .then( ( info ) => {
                console.log( `MongoDB at ${this.databaseUrl} is connected ! ${info}` );
            } )
            .catch( ( err ) => {
                console.error( err );
            } );

    }

    init () {
        super.init();

    }

    on ( eventName, callback ) {

        const availableEventNames = [ 'connecting', 'connected', 'open', 'disconnecting', 'disconnected', 'reconnected', 'close', 'error' ];

        if ( availableEventNames.indexOf( eventName ) === -1 ) {
            return
        }

        this._driver.connection.on( eventName, callback );

    }

}

/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TMySQLDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: MySQLDriver
            }
        };

        super( _parameters );

    }

    close ( /*onCloseCallback*/ ) {}

    connect () {

        const connection = this._driver.createConnection( {
            host:     'localhost',
            user:     'dbuser',
            password: 's3kreee7',
            database: 'my_db'
        } );

        connection.connect();

        connection.query( 'SELECT 1 + 1 AS solution', function ( err, rows, fields ) {
            if ( err ) {
                throw err
            }

            console.log( 'The solution is: ', rows[ 0 ].solution );
            console.log( 'The fields is: ', fields );
        } );

        connection.end();

    }

    on ( /*eventName, callback*/ ) {}

    _initDatabase () {
        super._initDatabase();

    }

}

/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TNeo4JDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: Neo4JDriver
            }
        };

        super( _parameters );

    }

    close ( /*onCloseCallback*/ ) {}

    connect () {

        this._driver.query( 'match (n) return n' ).exec().then(
            function ( response ) {
                console.log( response );
            },
            function ( fail ) {
                console.log( fail );
            }
        );

    }

    on ( /*eventName, callback*/ ) {}

    _initDatabase () {
        super._initDatabase();

    }

}

/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

//https://github.com/oracle/node-oracledb#-installation

class TOracleDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: OracleDBDriver
            }
        };

        super( _parameters );

    }

    close ( /*onCloseCallback*/ ) {}

    connect () {

        const config = {
            user:          'DbUser',
            password:      'DbPassword',
            connectString: 'localhost:1521/orcl'
        };

        async function getEmployee ( empId ) {
            let conn;

            try {
                conn = await this._driver.getConnection( config );

                const result = await conn.execute(
                    'select * from employees where employee_id = :id',
                    [ empId ]
                );

                console.log( result.rows[ 0 ] );
            } catch ( err ) {
                console.log( 'Ouch!', err );
            } finally {
                if ( conn ) { // conn assignment worked, need to close
                    await conn.close();
                }
            }
        }

        getEmployee( 101 );

    }

    on ( /*eventName, callback*/ ) {}

    _initDatabase () {
        super._initDatabase();

    }

}

/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const PostgreSQLDriver = PostgreSQL( {} );

class TPostgreSQLDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                host:     'localhost',
                port:     '5432',
                database: 'postgres'
            },
            ...parameters,
            ...{
                driver: PostgreSQLDriver
            }
        };

        super( _parameters );

        this._host     = _parameters.host;
        this._port     = _parameters.port;
        this._database = _parameters.database;

    }

    close ( /*onCloseCallback*/ ) {}

    connect () {

        this._driver.one( ` SELECT 1 `, [] )
            .then( ( data ) => {
                console.log( `PostgreSQL at ${this._host}:${this._port}/${this._database} is connected ! ${data}` );
            } )
            .catch( ( error ) => {
                console.log( 'PostgreSQL - Connection error ', error );
            } );
    }

    init () {
        super.init();

    }

    on ( /*eventName, callback*/ ) {}

}

class TPostgreSQLController extends TAbstractDataController {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                driver:      null,
                tableName:   '',
                tableFields: []
            }, ...parameters
        };

        super( _parameters );

        this.tableName   = _parameters.tableName;
        this.tableFields = _parameters.tableFields;

    }

    get tableFields () {

        return this._tableFields

    }

    set tableFields ( value ) {

        const valueName = 'Table fields';
        const expect    = 'Expect an instance of Array of String.';

        if ( isNull( value ) ) { throw new TypeError( `${valueName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${valueName} cannot be undefined ! ${expect}` ) }

        let fields = '';
        for ( let fieldIndex = 0, numberOfFileds = value.length ; fieldIndex < numberOfFileds ; fieldIndex++ ) {
            fields += `${value[ fieldIndex ]}, `;
        }

        this._tableFields = fields.slice( 0, -2 );

    }

    get tableName () {
        return this._tableName
    }

    set tableName ( value ) {

        const valueName = 'Table name';
        const expect    = 'Expect an instance of String.';

        if ( isNull( value ) ) { throw new TypeError( `${valueName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${valueName} cannot be undefined ! ${expect}` ) }
        if ( isNotString( value ) ) { throw new TypeError( `${valueName} cannot be an instance of ${value.constructor.name} ! ${expect}` ) }

        this._tableName = value;

    }

    setTableName ( value ) {

        this.tableName = value;
        return this

    }

    _createMany ( datas, response ) {
        super._createOne( datas, response );

        const _datas      = [];
        const _errors     = [];
        let numberOfDatas = datas.length;
        let data          = null;
        let dataKeys      = null;
        let dataValues    = null;
        let counter       = null;
        let parameters    = null;
        let values        = null;
        let query         = null;

        for ( let subDataKey in datas ) {

            data       = datas[ subDataKey ];
            dataKeys   = Object.keys( data );
            dataValues = Object.values( data );
            counter    = 0;
            parameters = '(';
            values     = '(';
            for ( let key in dataKeys ) {
                counter++;
                parameters += `${key}, `;
                values += `$${counter}, `;
            }
            parameters = parameters.slice( 0, -2 );
            values     = values.slice( 0, -2 );
            parameters += ')';
            values += ')';

            query = `INSERT INTO ${this._tableName} ${parameters} VALUES ${values}`;

            this._driver
                .one( query, dataValues )
                .then( data => {
                    _datas.push( data );
                } )
                .catch( error => {
                    _errors.push( error );
                } )
                .finally( () => {

                    numberOfDatas--;
                    if ( numberOfDatas > 0 ) { return }

                    const haveData  = ( _datas.length > 0 );
                    const haveError = ( _errors.length > 0 );

                    if ( haveData && haveError ) {

                        TAbstractDataController.returnErrorAndData( _errors, _datas, response );

                    } else if ( !haveData && haveError ) {

                        TAbstractDataController.returnError( _errors, response );

                    } else if ( haveData && !haveError ) {

                        TAbstractDataController.returnData( _datas, response );

                    } else if ( !haveData && !haveError ) {

                        TAbstractDataController.returnData( null, response );

                    }

                } );

        }

    }

    _createOne ( data, response ) {
        super._createOne( data, response );

        const dataKeys   = Object.keys( data );
        const dataValues = Object.values( data );
        let counter      = 0;
        let parameters   = '(';
        let values       = '(';
        for ( let key in dataKeys ) {
            counter++;
            parameters += `${key}, `;
            values += `$${counter}, `;
        }
        parameters = parameters.slice( 0, -2 );
        values     = values.slice( 0, -2 );
        parameters += ')';
        values += ')';

        let query = `INSERT INTO ${this._tableName} ${parameters} VALUES ${values}`;

        this._driver
            .one( query, dataValues )
            .then( data => {
                TAbstractDataController.returnData( data, response );
            } )
            .catch( error => {
                TAbstractDataController.returnError( error, response );
            } );

    }

    _deleteAll ( response ) {
        super._deleteAll( response );

        this._driver
            .one( ` TRUNCATE TABLE ${this._tableName} ` )
            .then( data => {
                TAbstractDataController.returnData( data, response );
            } )
            .catch( error => {
                TAbstractDataController.returnError( error, response );
            } );

    }

    _deleteMany ( ids, response ) {
        super._deleteMany( ids, response );

        this._driver
            .any( ` DELETE FROM ${this._tableName} WHERE id IN ($1:list) `, [ ids ] )
            .then( data => {
                TAbstractDataController.returnData( data, response );
            } )
            .catch( error => {
                TAbstractDataController.returnError( error, response );
            } );

    }

    _deleteOne ( id, response ) {
        super._deleteOne( id, response );

        this._driver
            .one( ` DELETE FROM ${this._tableName} WHERE id=$1 `, [ id ] )
            .then( data => {
                TAbstractDataController.returnData( data, response );
            } )
            .catch( error => {
                TAbstractDataController.returnError( error, response );
            } );

    }

    _deleteWhere ( query, response ) {
        super._deleteWhere( query, response );

        TAbstractDataController.returnError( 'DeleteWhere method is not implemented yet ! Sorry for the disagrement.', response );

    }

    _readAll ( projection, response ) {
        super._readAll( projection, response );

        this._driver
            .any( ` SELECT ${this._tableFields} FROM ${this._tableName} ` )
            .then( data => {
                TAbstractDataController.returnData( data, response );
            } )
            .catch( error => {
                TAbstractDataController.returnError( error, response );
            } );

    }

    _readMany ( ids, projection, response ) {
        super._readMany( ids, projection, response );

        this._driver
            .any( ` SELECT ${this._tableFields} FROM ${this._tableName} WHERE id IN ($1:list)`, [ ids ] )
            .then( data => {
                TAbstractDataController.returnData( data, response );
            } )
            .catch( error => {
                TAbstractDataController.returnError( error, response );
            } );

    }

    _readOne ( id, projection, response ) {
        super._readOne( id, projection, response );

        this._driver
            .one( ` SELECT ${this._tableFields} FROM ${this._tableName} WHERE id = $1 `, [ id ] )
            .then( data => {
                TAbstractDataController.returnData( data, response );
            } )
            .catch( error => {
                TAbstractDataController.returnError( error, response );
            } );

    }

    _readWhere ( query, projection, response ) {
        super._readWhere( query, projection, response );

        this._driver
            .any( ` SELECT ${this._tableFields} FROM ${this._tableName} WHERE ${projection}` )
            .then( data => {
                TAbstractDataController.returnData( data, response );
            } )
            .catch( error => {
                TAbstractDataController.returnError( error, response );
            } );
    }

    _updateAll ( update, response ) {
        super._updateAll( update, response );

        TAbstractDataController.returnError( 'UpdateAll method is not implemented yet ! Sorry for the disagrement.', response );

    }

    _updateMany ( ids, updates, response ) {
        super._updateMany( ids, updates, response );

        const numberOfIds     = ids.length;
        const numberOfUpdates = updates.length;

        if ( numberOfIds !== numberOfUpdates ) {
            TAbstractDataController.returnError( 'Number of ids doesn\'t match the number of updates. Abort updates !', response );
            return
        }

        const _datas      = [];
        const _errors     = [];
        let numberOfDatas = numberOfIds;
        let id            = null;
        let update        = null;
        let updateKeys    = null;
        let updateValues  = null;
        let counter       = null;
        let settings      = null;
        let query         = null;
        let dataToSend    = null;

        for ( let index = 0 ; index < numberOfUpdates ; index++ ) {

            id           = ids[ index ];
            update       = updates[ index ];
            updateKeys   = Object.keys( update );
            updateValues = Object.values( update );
            counter      = 1;
            settings     = '';
            for ( let key in updateKeys ) {
                counter++;
                settings += `${key}=$${counter}, `;
            }
            settings = settings.slice( 0, -2 );
            settings += ')';

            query      = ` UPDATE ${this._tableName} SET ${settings} WHERE id=$1 `;
            dataToSend = [ id ].concat( updateValues );

            this._driver
                .one( query, dataToSend )
                .then( data => {
                    _datas.push( data );
                } )
                .catch( error => {
                    _errors.push( error );
                } )
                .finally( () => {

                    numberOfDatas--;
                    if ( numberOfDatas > 0 ) { return }

                    const haveData  = ( _datas.length > 0 );
                    const haveError = ( _errors.length > 0 );

                    if ( haveData && haveError ) {

                        TAbstractDataController.returnErrorAndData( _errors, _datas, response );

                    } else if ( !haveData && haveError ) {

                        TAbstractDataController.returnError( _errors, response );

                    } else if ( haveData && !haveError ) {

                        TAbstractDataController.returnData( _datas, response );

                    } else if ( !haveData && !haveError ) {

                        TAbstractDataController.returnData( null, response );

                    }

                } );

        }

    }

    _updateOne ( id, update, response ) {
        super._updateOne( id, update, response );

        const dataKeys   = Object.keys( update );
        const dataValues = Object.values( update );
        let counter      = 1;
        let settings     = '';
        for ( let key in dataKeys ) {
            counter++;
            settings += `${key}=$${counter}, `;
        }
        settings = settings.slice( 0, -2 );
        settings += ')';

        let query   = ` UPDATE ${this._tableName} SET ${settings} WHERE id=$1 `;
        let updates = [ id ].concat( dataValues );

        this._driver
            .one( query, updates )
            .then( data => {
                TAbstractDataController.returnData( data, response );
            } )
            .catch( error => {
                TAbstractDataController.returnError( error, response );
            } );

    }

    _updateWhere ( query, update, response ) {
        super._updateWhere( query, update, response );

        TAbstractDataController.returnError( 'UpdateWhere method is not implemented yet ! Sorry for the disagrement.', response );

    }

    /// UTILS

}

/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TRedisDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: RedisDriver
            }
        };

        super( _parameters );

    }

    close ( /*onCloseCallback*/ ) {}

    connect () {

        var client = this._driver.createClient();

        client.on( 'error', function ( err ) {
            console.log( 'Error ' + err );
        } );

        client.set( 'string key', 'string val', this._driver.print );
        client.hset( 'hash key', 'hashtest 1', 'some value', this._driver.print );
        client.hset( [ 'hash key', 'hashtest 2', 'some other value' ], this._driver.print );

        client.hkeys( 'hash key', function ( err, replies ) {
            console.log( replies.length + ' replies:' );

            replies.forEach( function ( reply, i ) {
                console.log( '    ' + i + ': ' + reply );
            } );

            client.quit();
        } );

    }

    init () {
        super.init();

    }

    on ( /*eventName, callback*/ ) {}

}

/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TSQLiteDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: SQLiteDriver
            }
        };

        super( _parameters );

    }

    close ( /*onCloseCallback*/ ) {}

    connect () {

        var db = new this._driver.Database( ':memory:' );

        db.serialize( function () {
            db.run( 'CREATE TABLE lorem (info TEXT)' );
            var stmt = db.prepare( 'INSERT INTO lorem VALUES (?)' );

            for ( var i = 0 ; i < 10 ; i++ ) {
                stmt.run( 'Ipsum ' + i );
            }

            stmt.finalize();

            db.each( 'SELECT rowid AS id, info FROM lorem', function ( err, row ) {
                console.log( row.id + ': ' + row.info );
            } );
        } );

        db.close();

    }

    init () {
        super.init();

    }

    on ( /*eventName, callback*/ ) {}
}

/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const DEFAULT_CONNECT_TIMEOUT        = 15 * 1000;
const DEFAULT_CLIENT_REQUEST_TIMEOUT = 15 * 1000;
const DEFAULT_CANCEL_TIMEOUT         = 5 * 1000;
const DEFAULT_CONNECT_RETRY_INTERVAL = 500;
const DEFAULT_PACKET_SIZE            = 4 * 1024;
const DEFAULT_TEXTSIZE               = 2147483647;
const DEFAULT_DATEFIRST              = 7;
const DEFAULT_PORT                   = 1433;
const DEFAULT_TDS_VERSION            = '7_4';
const DEFAULT_LANGUAGE               = 'us_english';
const DEFAULT_DATEFORMAT             = 'mdy';

class TSQLServerDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                server:         'localhost',
                authentication: {
                    type:    [ 'default', 'ntlm', 'azure-active-directory-password', 'azure-active-directory-access-token' ][ 0 ],
                    options: {
                        userName: 'dbo',
                        password: 'intelCOREi7'
                        //                        domain:   'IG'
                    }
                },
                options: {
                    abortTransactionOnError:  false,
                    appName:                  undefined,
                    camelCaseColumns:         false,
                    cancelTimeout:            DEFAULT_CANCEL_TIMEOUT,
                    columnNameReplacer:       undefined,
                    connectionRetryInterval:  DEFAULT_CONNECT_RETRY_INTERVAL,
                    connectTimeout:           DEFAULT_CONNECT_TIMEOUT,
                    //                    connectionIsolationLevel:         ISOLATION_LEVEL.READ_COMMITTED,
                    cryptoCredentialsDetails: {},
                    database:                 undefined,
                    datefirst:                DEFAULT_DATEFIRST,
                    dateFormat:               DEFAULT_DATEFORMAT,
                    debug:                    {
                        data:    false,
                        packet:  false,
                        payload: false,
                        token:   false
                    },
                    enableAnsiNull:                   true,
                    enableAnsiNullDefault:            true,
                    enableAnsiPadding:                true,
                    enableAnsiWarnings:               true,
                    enableArithAbort:                 false,
                    enableConcatNullYieldsNull:       true,
                    enableCursorCloseOnCommit:        null,
                    enableImplicitTransactions:       false,
                    enableNumericRoundabort:          false,
                    enableQuotedIdentifier:           true,
                    encrypt:                          false,
                    fallbackToDefaultDb:              false,
                    instanceName:                     undefined,
                    //                    isolationLevel:                   ISOLATION_LEVEL.READ_COMMITTED,
                    language:                         DEFAULT_LANGUAGE,
                    localAddress:                     undefined,
                    maxRetriesOnTransientErrors:      3,
                    multiSubnetFailover:              false,
                    packetSize:                       DEFAULT_PACKET_SIZE,
                    port:                             DEFAULT_PORT,
                    readOnlyIntent:                   false,
                    requestTimeout:                   DEFAULT_CLIENT_REQUEST_TIMEOUT,
                    rowCollectionOnDone:              false,
                    rowCollectionOnRequestCompletion: false,
                    tdsVersion:                       DEFAULT_TDS_VERSION,
                    textsize:                         DEFAULT_TEXTSIZE,
                    trustServerCertificate:           true,
                    useColumnNames:                   false,
                    useUTC:                           true
                }
            },
            ...parameters
        };

        _parameters.driver = {
            SqlServerDriver: SqlServerDriver,
            Connection:      new Connection( _parameters ),
            Request:         Request
        };

        super( _parameters );

    }

    close ( onCloseCallback ) {

        this._driver.Connection.close();
        onCloseCallback();

    }

    connect () {

        this._driver.Connection.on( 'connect', connectionError => {

            if ( connectionError ) {
                console.error( connectionError );
                return
            }

            console.log( `SQLServer at XXX is connected !` );

            //            connection.close()

        } );

    }

    init () {
        super.init();

    }

    on ( /*eventName, callback*/ ) {}

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TSQLServerController
 * @classdesc The TSQLServerController is the base class to perform CRUD operations on the database
 */

class TSQLServerController extends TAbstractDataController {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                driver:    null,
                tableName: '',
                columns:   []
            }, ...parameters
        };

        super( _parameters );

        this.tableName = _parameters.tableName;
        this.columns   = _parameters.columns;

    }

    get tableName () {
        return this._tableName
    }

    set tableName ( value ) {

        const valueName = 'Table name';
        const expect    = 'Expect an instance of String.';

        if ( isNull( value ) ) { throw new TypeError( `${valueName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${valueName} cannot be undefined ! ${expect}` ) }
        if ( isNotString( value ) ) { throw new TypeError( `${valueName} cannot be an instance of ${value.constructor.name} ! ${expect}` ) }

        this._tableName = value;

    }

    get columns () {
        return this._columns
    }

    set columns ( value ) {

        const valueName = 'Columns';
        const expect    = 'Expect an array of strings.';

        if ( isNull( value ) ) { throw new TypeError( `${valueName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${valueName} cannot be undefined ! ${expect}` ) }
        if ( isNotArrayOfString( value ) ) { throw new TypeError( `${valueName} cannot be an instance of ${value.constructor.name} ! ${expect}` ) }

        this._columns = value;

    }

    setTableName ( value ) {

        this.tableName = value;
        return this

    }

    setColumns ( value ) {

        this.columns = value;
        return this

    }

    _createMany ( datas, response ) {
        super._createMany( datas, response );

        const columns         = this.columns;
        const formatedColumns = columns.toString();

        let data           = null;
        let formatedValues = '';
        let value          = null;

        for ( let index = 0, numberOfDatas = datas.length ; index < numberOfDatas ; index++ ) {
            data = datas[ index ];

            formatedValues += `(`;
            for ( let key in data ) {

                if ( !columns.includes( key ) ) { continue }

                value = data[ key ];

                if ( isString( value ) ) {
                    formatedValues += `'${value}', `;
                } else {
                    formatedValues += `${value}, `;
                }

            }
            formatedValues = formatedValues.slice( 0, -2 );
            formatedValues += `), `;

        }
        formatedValues = formatedValues.slice( 0, -2 );

        const query   = `INSERT INTO ${this._tableName} (${formatedColumns}) VALUES ${formatedValues}`;
        const request = new this._driver.Request( query, this.return( response ) );

        this._driver.Connection.execSql( request );

    }

    _createOne ( data, response ) {
        super._createOne( data, response );

        const columns = this.columns;

        let formatedColumns = '';
        let column          = null;
        let formatedValues  = '';
        let value           = null;
        for ( let index = 0, numberOfColumns = columns.length ; index < numberOfColumns ; index++ ) {
            column = columns[ index ];
            value  = data[ column ];

            if ( value ) {
                formatedColumns += `${column}, `;

                if ( isString( value ) ) {
                    formatedValues += `'${value}', `;
                } else {
                    formatedValues += `${value}, `;
                }
            }
        }
        formatedColumns = formatedColumns.slice( 0, -2 );
        formatedValues  = formatedValues.slice( 0, -2 );

        const query   = `INSERT INTO ${this._tableName} (${formatedColumns}) VALUES (${formatedValues})`;
        const request = new this._driver.Request( query, this.return( response ) );

        this._driver.Connection.execSql( request );

    }

    _deleteAll ( response ) {
        super._deleteAll( response );

        const query   = `TRUNCATE TABLE ${this._tableName}`;
        const request = new this._driver.Request( query, this.return( response ) );

        this._driver.Connection.execSql( request );

    }

    _deleteMany ( ids, response ) {
        super._deleteMany( ids, response );

        const query   = `DELETE FROM ${this._tableName} WHERE id IN (${ids})`;
        const request = new this._driver.Request( query, this.return( response ) );

        this._driver.Connection.execSql( request );

    }

    _deleteOne ( id, response ) {
        super._deleteOne( id, response );

        const query   = `DELETE FROM ${this._tableName} WHERE id=${id}`;
        const request = new this._driver.Request( query, this.return( response ) );

        this._driver.Connection.execSql( request );

    }

    _deleteWhere ( query, response ) {
        super._deleteWhere( query, response );

        TAbstractDataController.returnError( 'Unimplemented methods (DELETE WHERE)', response );

    }

    _readAll ( projection, response ) {
        super._readAll( projection, response );

        const query   = `SELECT * FROM ${this.tableName}`;
        const request = new this._driver.Request( query, ( requestError, rowCount, results ) => {

            console.log( `Get ${rowCount} elements.` );

            if ( requestError ) {

                TAbstractDataController.returnError( requestError, response );

            } else if ( results.length === 0 ) {

                TAbstractDataController.returnNotFound( response );

            } else {

                TAbstractDataController.returnData( results, response );

            }

        } );

        request.on( 'row', columns => {

            let result = {};
            columns.forEach( column => {

                result[ column.metadata.colName ] = column.value;

            } );

        } );

        this._driver.Connection.execSql( request );

    }

    _readMany ( ids, projection, response ) {
        super._readMany( ids, projection, response );

        const idsFormated = ids.toString();
        const query       = `SELECT * FROM ${this.tableName} WHERE id IN (${idsFormated})`;

        const request = new this._driver.Request( query, ( requestError, rowCount, results ) => {

            console.log( `Get ${rowCount} elements !` );

            if ( requestError ) {

                TAbstractDataController.returnError( requestError, response );

            } else if ( results.length === 0 ) {

                TAbstractDataController.returnNotFound( response );

            } else {

                TAbstractDataController.returnData( results, response );

            }

        } );

        request.on( 'row', columns => {

            let result = {};
            columns.forEach( column => {

                result[ column.metadata.colName ] = column.value;

            } );

        } );

        this._driver.Connection.execSql( request );

    }

    _readOne ( id, projection, response ) {
        super._readOne( id, projection, response );

        const query   = `SELECT * FROM ${this.tableName} WHERE id=${id}`;
        const request = new this._driver.Request( query, ( requestError, rowCount, results ) => {

            console.log( `Get ${rowCount} elements !` );

            if ( requestError ) {

                TAbstractDataController.returnError( requestError, response );

            } else if ( results.length === 0 ) {

                TAbstractDataController.returnNotFound( response );

            } else {

                TAbstractDataController.returnData( results, response );

            }

        } );

        request.on( 'row', columns => {

            let result = {};
            columns.forEach( column => {

                result[ column.metadata.colName ] = column.value;

            } );

        } );

        this._driver.Connection.execSql( request );

    }

    _readWhere ( query, projection, response ) {
        super._readWhere( query, projection, response );

        TAbstractDataController.returnError( 'Unimplemented methods (READ WHERE)', response );

    }

    _updateAll ( update, response ) {
        super._updateAll( update, response );

        let formatedUpdates = '';
        for ( let key in update ) {
            const formatedUpdate = update[ key ];
            if ( isString( formatedUpdate ) ) {
                formatedUpdates += `${key} = '${formatedUpdate}', `;
            } else {
                formatedUpdates += `${key} = ${formatedUpdate}, `;
            }
        }
        formatedUpdates = formatedUpdates.slice( 0, -2 );

        const query   = `UPDATE ${this._tableName} SET ${formatedUpdates}`;
        const request = new this._driver.Request( query, this.return( response ) );

        this._driver.Connection.execSql( request );

    }

    _updateMany ( ids, updates, response ) {
        super._updateMany( ids, updates, response );

        let formatedUpdates = '';
        let formatedUpdate  = null;
        for ( let key in updates ) {
            formatedUpdate = updates[ key ];
            if ( isString( formatedUpdate ) ) {
                formatedUpdates += `${key} = '${formatedUpdate}', `;
            } else {
                formatedUpdates += `${key} = ${formatedUpdate}, `;
            }
        }
        formatedUpdates = formatedUpdates.slice( 0, -2 );

        const query   = `UPDATE ${this._tableName} SET ${formatedUpdates} WHERE id IN (${ids})`;
        const request = new this._driver.Request( query, this.return( response ) );

        this._driver.Connection.execSql( request );

    }

    _updateOne ( id, update, response ) {
        super._updateOne( id, update, response );

        let formatedUpdates = '';
        let formatedUpdate  = null;
        for ( let key in update ) {
            formatedUpdate = update[ key ];
            if ( isString( formatedUpdate ) ) {
                formatedUpdates += `${key} = '${formatedUpdate}', `;
            } else {
                formatedUpdates += `${key} = ${formatedUpdate}, `;
            }
        }
        formatedUpdates = formatedUpdates.slice( 0, -2 );

        const query   = `UPDATE ${this._tableName} SET ${formatedUpdates} WHERE id=${id}`;
        const request = new this._driver.Request( query, this.return( response ) );

        this._driver.Connection.execSql( request );

    }

    _updateWhere ( query, update, response ) {
        super._updateWhere( query, update, response );

        TAbstractDataController.returnError( 'Unimplemented methods (UPDATE WHERE)', response );

    }

}

export { MemoryWriteStream, TAbstractConverterManager, TAbstractDataController, TAbstractDataConverter, TAbstractDataInserter, TAbstractDatabase, TAbstractDatabasePlugin, TAbstractFileConverter, TCassandraDatabase, TCouchBaseDatabase, TCouchDBDatabase, TElasticSearchDatabase, TLevelDBDatabase, TMongoDBDatabase, TMongoDBPlugin, TMongooseController, TMySQLDatabase, TNeo4JDatabase, TOracleDatabase, TPostgreSQLController, TPostgreSQLDatabase, TRedisDatabase, TSQLServerController, TSQLServerDatabase, TSQLiteDatabase };
//# sourceMappingURL=itee-database.esm.js.map
