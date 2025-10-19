/**
 * ┳      ┳┓     ┓          ┏┓ ┏┓ ┏┓      ┏┓            ┏┳ 
 * ┃╋┏┓┏┓ ┃┃┏┓╋┏┓┣┓┏┓┏┏┓  ┓┏┣┫  ┫ ┃┫  ━━  ┃ ┏┓┏┳┓┏┳┓┏┓┏┓ ┃┏
 * ┻┗┗ ┗ •┻┛┗┻┗┗┻┗┛┗┻┛┗   ┗┛┗┛•┗┛•┗┛      ┗┛┗┛┛┗┗┛┗┗┗┛┛┗┗┛┛
 *                                                         
 * @desc    The abstract database side of the Itee solution for 3d web content, this package is design to be inherited and run on an Itee server.
 * @author  [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 * 
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var iteeValidators = require('itee-validators');
var iteeCore = require('itee-core');
var path = require('path');
var globalBuffer = require('buffer');
var fs = require('fs');
var stream = require('stream');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
	if (e && e.__esModule) return e;
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n["default"] = e;
	return Object.freeze(n);
}

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var globalBuffer__namespace = /*#__PURE__*/_interopNamespace(globalBuffer);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);

// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
var getRandomValues;
var rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
    // find the complete implementation of crypto (msCrypto) on IE11.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

function validate(uuid) {
  return typeof uuid === 'string' && REGEX.test(uuid);
}

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

var byteToHex = [];

for (var i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).substr(1));
}

function stringify(arr) {
  var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!validate(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

function v4(options, buf, offset) {
  options = options || {};
  var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (var i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return stringify(rnds);
}

/**
 * @module Messages/AbstractError
 * @desc Export the AbstractError abstract class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires {@link https://github.com/uuidjs/uuid uuid}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The AbstractError is the base class for all derived errors.
 * It is composed by an uuid v4, the name which is based on the instance constructor name, and a message
 *
 * @extends Error
 */
class AbstractError extends Error {

    /**
     * @constructor
     * @param message {string} The error message to dispatch
     */
    constructor ( message ) {
        super();

        this._uuid    = v4();
        this._name    = this.constructor.name;
        this._message = ( () => {
            // Validate message before assign it as readonly property !
            const expect = 'Expect a non empty string.';
            if ( iteeValidators.isNotDefined( message ) ) { throw new ReferenceError( `The error message cannot be null or undefined. ${ expect }` )}
            if ( iteeValidators.isNotString( message ) ) { throw new TypeError( `The error message cannot be an instance of ${ message.constructor.name }. ${ expect }` )}
            if ( iteeValidators.isEmptyString( message ) ) { throw new TypeError( `The error message cannot be an empty string. ${ expect }` )}
            if ( iteeValidators.isBlankString( message ) ) { throw new TypeError( `The error message cannot be a blank string. ${ expect }` )}

            return message
        } )();

        // Override the default Error stack behavior and apply get/set to avoid mutation
        this._stack = this.stack;

        /**
         * The stack trace of the error
         * @member module:Messages/AbstractError~AbstractError#stack
         * @readonly
         * @type {string}
         */
        Object.defineProperty( this, 'stack', {
            get: () => { return this._stack },
            set: () => { throw new SyntaxError( 'Try to assign a read only property.' ) }
        } );


    }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isAbstractError () { return true }
    /**
     * An auto-generated universally unique identifier, this allow to recognize any error by id
     * @readonly
     * @type {string}
     */
    get uuid () { return this._uuid }
    set uuid ( value ) { throw new SyntaxError( 'Try to assign a read only property.' ) }
    /**
     * The name of current instanced error (a.k.a the constructor name)
     * @readonly
     * @type {string}
     */
    get name () { return this._name }
    set name ( value ) { throw new SyntaxError( 'Try to assign a read only property.' ) }
    /**
     * The error message
     * @readonly
     * @type {string}
     */
    get message () { return this._message }
    set message ( value ) { throw new SyntaxError( 'Try to assign a read only property.' ) }

}

/**
 * @module Messages/HTTP/AbstractHTTPError
 * @desc Export the AbstractHTTPError abstract class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/AbstractError~AbstractError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The AbstractHTTPError is the base class for all derived HTTPError.
 * It extend is AbstractError and agmente it with the status code notion.
 *
 * @extends module:Messages/AbstractError~AbstractError
 */
class AbstractHTTPError extends AbstractError {

    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    static get isAbstractHTTPError () { return true }

    /**
     * The abstract getter of http status code, internally it call the static getter statusCode that need to be reimplemented by extended class.
     * @readonly
     * @abstract
     * @type {number}
     * @throws {ReferenceError} In case the static statusCode getter is not redefined in class that inherit this class.
     */
    get statusCode () {
        if ( iteeValidators.isNotDefined( this.constructor.statusCode ) ) {
            throw new ReferenceError( `${ this.name } class need to reimplement static statusCode getter.` )
        }
        return this.constructor.statusCode
    }

    set statusCode ( value ) {
        throw new SyntaxError( 'Try to assign a read only property.' )
    }
}

/**
 * @module Messages/HTTP/UnknownError
 * @desc Export the UnknownError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class UnknownError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 520
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 520 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isUnknownError () { return true }

}

/**
 * @module Databases/TAbstractResponder
 * @desc Export the TAbstractResponder abstract class.
 * @exports TAbstractResponder
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The TAbstractResponder is the base class for all derived database controller that require to send a response to client.
 * It allow to send preformatted response in function of database query result.
 */
class TAbstractResponder extends iteeCore.TAbstractObject {

    /**
     * Normalize errors that can be in different format like single string, object, array of string, or array of object.
     *
     * @example <caption>Normalized error are simple literal object like:</caption>
     * {
     *     name: 'TypeError',
     *     message: 'the error message'
     * }
     *
     * @param {String|Object|Array.<String>|Array.<Object>} errors - The error object to normalize
     * @returns {Array.<Object>}
     * @private
     */
    static _formatErrors ( errors = [] ) {

        const _errors = ( iteeValidators.isArray( errors ) ) ? errors : [ errors ];

        let formattedErrors = [];

        for ( let i = 0, numberOfErrors = _errors.length ; i < numberOfErrors ; i++ ) {
            formattedErrors.push( TAbstractResponder._formatError( _errors[ i ] ) );
        }

        return formattedErrors

    }
    /**
     * Normalize error that can be in different format like single string, object, array of string, or array of object.
     *
     * @example <caption>Normalized error are simple literal object like:</caption>
     * {
     *     name: 'TypeError',
     *     message: 'the error message'
     * }
     *
     * @param {String|Object|Error} error - The error object to normalize
     * @returns {AbstractHTTPError}
     * @private
     */
    static _formatError ( error ) {

        let formattedError;

        if ( error instanceof Error ) {

            formattedError = error;
            formattedError.statusCode = 500;

        } else if ( iteeValidators.isString( error ) ) {

            formattedError = new UnknownError( error );

        } else if ( iteeValidators.isObject( error ) ) {

            const name    = error.name;
            const message = error.message || 'Empty message...';

            formattedError = new UnknownError( message );
            if ( name ) {
                formattedError.name = name;
            }

        } else {

            formattedError = new UnknownError( error.toString() );

        }

        return formattedError

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

        if ( iteeValidators.isFunction( response ) ) { return response() }
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

        if ( iteeValidators.isFunction( response ) ) { return response( error, null ) }
        if ( response.headersSent ) { return }

        const formatedError = TAbstractResponder._formatError( error );

        response.format( {

            'application/json': () => {
                response.status( formatedError.statusCode ).json( formatedError );
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

        if ( iteeValidators.isFunction( response ) ) { return response( null, data ) }
        if ( response.headersSent ) { return }

        const _data = iteeValidators.isArray( data ) ? data : [ data ];

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

        if ( iteeValidators.isFunction( response ) ) { return response( error, data ) }
        if ( response.headersSent ) { return }

        const result = {
            errors: TAbstractResponder._formatErrors( error ),
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
                returnErrorAndData: TAbstractResponder.returnErrorAndData.bind( this ),
                returnError:        TAbstractResponder.returnError.bind( this ),
                returnData:         TAbstractResponder.returnData.bind( this ),
                returnNotFound:     TAbstractResponder.returnNotFound.bind( this )
            } );

        /**
         * The callback that will be used for parse database response
         */
        function dispatchResult ( error = null, data = null ) {

            const haveData  = iteeValidators.isDefined( data );
            const haveError = iteeValidators.isDefined( error );

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
            ...{},
            ...parameters
        };

        super( _parameters );
    }

}

/**
 * @module Messages/HTTP/ClientErrors/UnprocessableEntityError
 * @desc Export the AbstractHTTPError abstract class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class UnprocessableEntityError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 422
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 422 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isUnprocessableEntityError () { return true }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TDatabaseController
 * @classdesc The TDatabaseController is the base class to perform CRUD operations on the database
 */

/**
 * @class
 * @classdesc The TDatabaseController is the base class to perform CRUD operations on the database
 * @augments module:Databases/TAbstractResponder~TAbstractResponder
 */
class TAbstractDataController extends TAbstractResponder {

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
        };

        super( _parameters );

        /**
         * The database drive to use internally
         * @throws {TypeError} Will throw an error if the argument is null.
         * @throws {TypeError} Will throw an error if the argument is undefined.
         */
        this.driver = _parameters.driver;
        this.useNext = _parameters.useNext;

    }
    get useNext () {
        return this._useNext
    }
    set useNext ( value ) {
        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Driver cannot be null ! Expect a database driver.' ) }
        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Driver cannot be undefined ! Expect a database driver.' ) }
        if ( iteeValidators.isNotBoolean( value ) ) { throw new TypeError( 'Driver cannot be undefined ! Expect a database driver.' ) }

        this._useNext = value;
    }
    get driver () {
        return this._driver
    }
    set driver ( value ) {
        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Driver cannot be null ! Expect a database driver.' ) }
        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Driver cannot be undefined ! Expect a database driver.' ) }

        this._driver = value;
    }

    //////////////////
    // CRUD Methods //
    //////////////////
    create ( request, response, next ) {

        const data = request.body;

        if ( iteeValidators.isNotDefined( data ) ) {

            TAbstractDataController.returnError(
                new UnprocessableEntityError( 'Le corps de la requete ne peut pas être null ou indefini.' ),
                ( this.useNext ) ? next : response
            );

        } else if ( iteeValidators.isArray( data ) ) {

            if ( iteeValidators.isEmptyArray( data ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'objet de la requete ne peut pas être vide.` ),
                    ( this.useNext ) ? next : response
                );

            } else {

                this._createMany( data, response, next );

            }

        } else if ( iteeValidators.isObject( data ) ) {

            if ( iteeValidators.isEmptyObject( data ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'objet de la requete ne peut pas être vide.` ),
                    ( this.useNext ) ? next : response
                );

            } else {

                this._createOne( data, response, next );

            }

        } else {

            TAbstractDataController.returnError(
                new UnprocessableEntityError( `Le type de donnée de la requete est invalide. Les paramètres valides sont objet ou un tableau d'objet.` ),
                ( this.useNext ) ? next : response
            );

        }

    }

    _createOne ( /*data, response, next*/ ) {}

    _createMany ( /*datas, response, next*/ ) {}

    read ( request, response, next ) {

        const id          = request.params[ 'id' ];
        const requestBody = request.body;
        const haveBody    = ( iteeValidators.isDefined( requestBody ) );
        const ids         = ( haveBody ) ? requestBody.ids : null;
        const query       = ( haveBody ) ? requestBody.query : null;
        const projection  = ( haveBody ) ? requestBody.projection : null;

        if ( iteeValidators.isDefined( id ) ) {

            if ( iteeValidators.isNotString( id ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'identifiant devrait être une chaine de caractères.` ),
                    ( this.useNext ) ? next : response
                );

            } else if ( iteeValidators.isEmptyString( id ) || iteeValidators.isBlankString( id ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'identifiant ne peut pas être une chaine de caractères vide.` ),
                    ( this.useNext ) ? next : response
                );

            } else {

                this._readOne( id, projection, response, next );

            }

        } else if ( iteeValidators.isDefined( ids ) ) {

            if ( iteeValidators.isNotArray( ids ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'identifiants devrait être un tableau de chaine de caractères.` ),
                    ( this.useNext ) ? next : response
                );

            } else if ( iteeValidators.isEmptyArray( ids ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'identifiants ne peut pas être vide.` ),
                    ( this.useNext ) ? next : response
                );

            } else {

                this._readMany( ids, projection, response, next );

            }

        } else if ( iteeValidators.isDefined( query ) ) {

            if ( iteeValidators.isNotObject( query ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `La requete devrait être un objet javascript.` ),
                    ( this.useNext ) ? next : response
                );

            } else if ( iteeValidators.isEmptyObject( query ) ) {

                this._readAll( projection, response, next );

            } else {

                this._readWhere( query, projection, response, next );

            }

        } else {

            TAbstractDataController.returnError(
                new UnprocessableEntityError( `La requete ne peut pas être null.` ),
                ( this.useNext ) ? next : response
            );

        }

    }

    _readOne ( /*id, projection, response, next*/ ) {}

    _readMany ( /*ids, projection, response, next*/ ) {}

    _readWhere ( /*query, projection, response, next*/ ) {}

    _readAll ( /*projection, response, next*/ ) {}

    update ( request, response, next ) {

        const id          = request.params[ 'id' ];
        const requestBody = request.body;
        const haveBody    = ( iteeValidators.isDefined( requestBody ) );
        const ids         = ( haveBody ) ? requestBody.ids : null;
        const query       = ( haveBody ) ? requestBody.query : null;
        const update      = ( haveBody ) ? requestBody.update : null;

        if ( iteeValidators.isNotDefined( update ) ) {

            TAbstractDataController.returnError(
                new UnprocessableEntityError( `La mise à jour a appliquer ne peut pas être null ou indefini.` ),
                ( this.useNext ) ? next : response
            );

        } else if ( iteeValidators.isDefined( id ) ) {

            if ( iteeValidators.isNotString( id ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'identifiant devrait être une chaine de caractères.` ),
                    ( this.useNext ) ? next : response
                );

            } else if ( iteeValidators.isEmptyString( id ) || iteeValidators.isBlankString( id ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'identifiant ne peut pas être une chaine de caractères vide.` ),
                    ( this.useNext ) ? next : response
                );

            } else {

                this._updateOne( id, update, response, next );

            }

        } else if ( iteeValidators.isDefined( ids ) ) {

            if ( iteeValidators.isNotArray( ids ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'identifiants devrait être un tableau de chaine de caractères.` ),
                    ( this.useNext ) ? next : response
                );

            } else if ( iteeValidators.isEmptyArray( ids ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'identifiants ne peut pas être vide.` ),
                    ( this.useNext ) ? next : response
                );

            } else {

                this._updateMany( ids, update, response, next );

            }

        } else if ( iteeValidators.isDefined( query ) ) {

            if ( iteeValidators.isNotObject( query ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `La requete devrait être un objet javascript.` ),
                    ( this.useNext ) ? next : response
                );

            } else if ( iteeValidators.isEmptyObject( query ) ) {

                this._updateAll( update, response, next );

            } else {

                this._updateWhere( query, update, response, next );

            }

        } else {

            TAbstractDataController.returnError(
                new UnprocessableEntityError( `La requete ne peut pas être vide.` ),
                ( this.useNext ) ? next : response
            );

        }

    }

    _updateOne ( /*id, update, response, next*/ ) {}

    _updateMany ( /*ids, updates, response, next*/ ) {}

    _updateWhere ( /*query, update, response, next*/ ) {}

    _updateAll ( /*update, response, next*/ ) {}

    delete ( request, response, next ) {

        const id          = request.params[ 'id' ];
        const requestBody = request.body;
        const haveBody    = ( iteeValidators.isDefined( requestBody ) );
        const ids         = ( haveBody ) ? requestBody.ids : null;
        const query       = ( haveBody ) ? requestBody.query : null;

        if ( iteeValidators.isDefined( id ) ) {

            if ( iteeValidators.isNotString( id ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'identifiant devrait être une chaine de caractères.` ),
                    ( this.useNext ) ? next : response
                );

            } else if ( iteeValidators.isEmptyString( id ) || iteeValidators.isBlankString( id ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `L'identifiant ne peut pas être une chaine de caractères vide.` ),
                    ( this.useNext ) ? next : response
                );

            } else {

                this._deleteOne( id, response, next );

            }

        } else if ( iteeValidators.isDefined( ids ) ) {

            if ( iteeValidators.isNotArray( ids ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'identifiants devrait être un tableau de chaine de caractères.` ),
                    ( this.useNext ) ? next : response
                );

            } else if ( iteeValidators.isEmptyArray( ids ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `Le tableau d'identifiants ne peut pas être vide.` ),
                    ( this.useNext ) ? next : response
                );

            } else {

                this._deleteMany( ids, response, next );

            }

        } else if ( iteeValidators.isDefined( query ) ) {

            if ( iteeValidators.isNotObject( query ) ) {

                TAbstractDataController.returnError(
                    new UnprocessableEntityError( `La requete devrait être un objet javascript.` ),
                    ( this.useNext ) ? next : response
                );

            } else if ( iteeValidators.isEmptyObject( query ) ) {

                this._deleteAll( response, next );

            } else {

                this._deleteWhere( query, response, next );

            }

        } else {

            TAbstractDataController.returnError(
                new UnprocessableEntityError( `La requete ne peut pas être vide.` ),
                ( this.useNext ) ? next : response
            );

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
 */

// Todo: Extend sort of Factory
class TAbstractConverterManager extends TAbstractResponder {

    static _convertFilesObjectToArray ( files ) {

        const fileArray = [];

        for ( let field in files ) {

            if ( Object.prototype.hasOwnProperty.call( files, field ) ) {

                fileArray.push( files[ field ] );

            }

        }

        return fileArray

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

        super();

        this._driver            = _parameters.driver;
        this._useNext           = _parameters.useNext;
        this._converters        = _parameters.converters;
        this._convertersOptions = _parameters.convertersOptions;
        this._rules             = _parameters.rules;
        this._inserter          = new _parameters.inserter( {
            driver: this._driver
        } );

        this._errors         = [];
        this._processedFiles = [];
        this._filesToProcess = 0;
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

        this._filesToProcess--;
        this._checkEndOfReturns( response, next, data );

    }

    _fileConversionProgressCallback ( response, progress ) {

        this.logger.log( progress );

    }

    _fileConversionErrorCallback ( response, next, error ) {

        this._errors.push( error );
        this._filesToProcess--;
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

        const files         = TAbstractConverterManager._convertFilesObjectToArray( request.files );
        const numberOfFiles = files.length;
        if ( numberOfFiles === 0 ) {

            if ( this._useNext ) {
                next( `Aucun fichier à traiter !` );
                return
            } else {
                TAbstractConverterManager.returnError( `Aucun fichier à traiter !`, response );
            }

        }

        this._convertersOptions = request.body;

        // protect again multi-request from client on large file that take time to return response
        const availableFiles = [];
        for ( let fileIndex = 0 ; fileIndex < numberOfFiles ; fileIndex++ ) {

            let file = files[ fileIndex ];

            if ( this._processedFiles.includes( file.name ) ) {

                if ( this._useNext ) {
                    next( `Le fichier ${ file.name } à déjà été inséré.` );
                    return
                } else {
                    TAbstractConverterManager.returnError( `Le fichier ${ file.name } à déjà été inséré.`, response );
                }

            }

            this._processedFiles.push( file.name );
            availableFiles.push( file );

        }

        const availableFilesNumber = availableFiles.length;
        if ( availableFilesNumber === 0 ) {

            if ( this._useNext ) {
                next( `Impossible d'analyser ${ availableFilesNumber } fichiers associatifs simultanément !` );
                return
            } else {
                TAbstractConverterManager.returnError( `Impossible d'analyser ${ availableFilesNumber } fichiers associatifs simultanément !`, response );
            }

        }

        this._filesToProcess += availableFilesNumber;

        this._processFiles( availableFiles, this._convertersOptions, response, next );

    }

    _processFiles ( files, parameters, response, next ) {

        const fileExtensions = files.map( ( file ) => path__default["default"].extname( file.name ) );
        const matchingRules  = this._rules.filter( elem => {

            const availables = elem.on;

            if ( iteeValidators.isArray( availables ) ) {

                for ( let i = 0 ; i < availables.length ; i++ ) {
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

            if ( iteeValidators.isArray( converterNames ) ) {

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
                    files[ 0 ],
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
class MemoryWriteStream extends stream.Writable {

    constructor ( options ) {

        super( options );

        const bufferSize  = options.bufferSize || globalBuffer__namespace.kStringMaxLength;
        this.memoryBuffer = Buffer.alloc( bufferSize );
        this.offset       = 0;
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

    toString () {

        const string = this.memoryBuffer.toString();
        this._releaseMemory();

        return string

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

        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Dump type cannot be null ! Expect a non empty string.' ) }
        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Dump type cannot be undefined ! Expect a non empty string.' ) }

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
        const file       = dataBloc.file;
        const parameters = dataBloc.parameters;
        const onSuccess  = dataBloc.onSuccess;
        const onProgress = dataBloc.onProgress;
        const onError    = dataBloc.onError;

        if ( iteeValidators.isString( file ) ) {

            self._dumpFileInMemoryAs(
                self._dumpType,
                file,
                parameters,
                _onDumpSuccess,
                _onProcessProgress,
                _onProcessError
            );

        } else {

            const data = file.data;

            switch ( self._dumpType ) {

                case TAbstractFileConverter.DumpType.ArrayBuffer: {

                    const bufferSize  = data.length;
                    const arrayBuffer = new ArrayBuffer( bufferSize );
                    const view        = new Uint8Array( arrayBuffer );

                    for ( let i = 0 ; i < bufferSize ; ++i ) {
                        view[ i ] = data[ i ];
                    }

                    _onDumpSuccess( arrayBuffer );

                }
                    break

                case TAbstractFileConverter.DumpType.JSON:
                    _onDumpSuccess( JSON.parse( data.toString() ) );
                    break

                case TAbstractFileConverter.DumpType.String:
                    _onDumpSuccess( data.toString() );
                    break

                default:
                    throw new RangeError( `Invalid switch parameter: ${ self._dumpType }` )

            }

        }

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

        const fileReadStream = fs__default["default"].createReadStream( file );

        fileReadStream.on( 'error', ( error ) => {

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
                    throw new RangeError( `Invalid switch parameter: ${ dumpType }` )

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

TAbstractFileConverter.DumpType = /*#__PURE__*/Object.freeze( {
    ArrayBuffer: 0,
    String:      1,
    JSON:        2
} );

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 */

class TAbstractDatabasePlugin extends iteeCore.TAbstractObject {

    static _registerRoutesTo ( Driver, Application, Router, ControllerCtors, descriptors, Logger ) {

        for ( let index = 0, numberOfDescriptor = descriptors.length ; index < numberOfDescriptor ; index++ ) {

            const descriptor      = descriptors[ index ];
            const ControllerClass = ControllerCtors.get( descriptor.controller.name );
            const controller      = new ControllerClass( {
                driver: Driver,
                ...descriptor.controller.options
            } );
            const router          = Router( { mergeParams: true } );

            Logger.log( `\tAdd controller for base route: ${ descriptor.route }` );
            Application.use( descriptor.route, TAbstractDatabasePlugin._populateRouter( router, controller, descriptor.controller.can, Logger ) );

        }

    }
    static _populateRouter ( router, controller, can = {}, Logger ) {

        for ( let _do in can ) {

            const action = can[ _do ];

            Logger.log( `\t\tMap route ${ action.over } on (${ action.on }) to ${ controller.constructor.name }.${ _do } method.` );
            router[ action.on ]( action.over, controller[ _do ].bind( controller ) );

        }

        return router

    }
    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                controllers: new Map(),
                descriptors: []
            },
            ...parameters
        };

        super( _parameters );

        this.controllers = _parameters.controllers;
        this.descriptors = _parameters.descriptors;

        this.__dirname = undefined;

    }
    get controllers () {
        return this._controllers
    }
    set controllers ( value ) {

        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Controllers cannot be null ! Expect a map of controller.' ) }
        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Controllers cannot be undefined ! Expect a map of controller.' ) }
        if ( !( value instanceof Map ) ) { throw new TypeError( `Controllers cannot be an instance of ${ value.constructor.name } ! Expect a map of controller.` ) }

        this._controllers = value;

    }
    get descriptors () {
        return this._descriptors
    }
    set descriptors ( value ) {

        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Descriptors cannot be null ! Expect an array of POJO.' ) }
        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Descriptors cannot be undefined ! Expect an array of POJO.' ) }

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

        TAbstractDatabasePlugin._registerRoutesTo( driver, application, router, this._controllers, this._descriptors, this.logger );

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

class TAbstractDatabase extends iteeCore.TAbstractObject {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                driver:      null,
                application: null,
                router:      null,
                plugins:     []
            },
            ...parameters
        };

        super( _parameters );

        this.driver      = _parameters.driver;
        this.application = _parameters.application;
        this.router      = _parameters.router;
        this.plugins     = _parameters.plugins;
    }

    get plugins () {

        return this._plugins

    }

    set plugins ( value ) {

        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Plugins cannot be null ! Expect an array of TDatabasePlugin.' ) }
        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Plugins cannot be undefined ! Expect an array of TDatabasePlugin.' ) }

        this._plugins = value;
        this._registerPlugins();

    }

    get router () {

        return this._router

    }

    set router ( value ) {

        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Router cannot be null ! Expect a Express Router.' ) }
        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Router cannot be undefined ! Expect a Express Router.' ) }

        this._router = value;

    }

    get application () {

        return this._application

    }

    set application ( value ) {

        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Application cannot be null ! Expect a Express Application.' ) }
        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Application cannot be undefined ! Expect a Express Application.' ) }

        this._application = value;

    }

    get driver () {

        return this._driver

    }

    set driver ( value ) {

        if ( iteeValidators.isNull( value ) ) { throw new TypeError( 'Driver cannot be null ! Expect a database driver.' ) }
        if ( iteeValidators.isUndefined( value ) ) { throw new TypeError( 'Driver cannot be undefined ! Expect a database driver.' ) }

        this._driver = value;

    }

    setPlugins ( value ) {

        this.plugins = value;
        return this

    }

    addPlugin ( value ) {

        this._plugins.push( value );

        const [ key, data ] = Object.entries( value )[ 0 ];
        this._registerPlugin( key, data );

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
            this._registerPlugin( name, config );
        }

    }

    _registerPlugin ( name, config ) {

        if ( this._registerPackagePlugin( name, config ) ) { return }
        if ( this._registerLocalPlugin( name, config ) ) { return }

        this.logger.error( `Unable to register the plugin ${ name } the package or local folder doesn't seem to exist ! Skip it.` );

    }

    _registerPackagePlugin ( name, config ) {

        let success = false;

        try {

            //[Itee:01/03/2022] Todo: Waiting better plugin management for package that expose more than instancied plugin
            let plugin = require( name );
            if(plugin.registerPlugin) {
                plugin = plugin.registerPlugin( config );
            }

            if ( plugin instanceof TAbstractDatabasePlugin ) {

                this.logger.log( `Use ${ name } plugin from node_modules` );
                plugin.__dirname = path__default["default"].dirname( require.resolve( name ) );
                plugin.registerTo( this.driver, this.application, this.router );

                success = true;

            } else {

                this.logger.error( `The plugin ${ name } doesn't seem to be an instance of an extended class from TAbstractDatabasePlugin ! Skip it.` );

            }

        } catch ( error ) {

            if ( !error.code || error.code !== 'MODULE_NOT_FOUND' ) {

                this.logger.error( error );

            }

        }

        return success

    }

    _registerLocalPlugin ( name, config ) {

        let success = false;

        try {

            //[Itee:01/03/2022] Todo: Waiting better plugin management for package that expose more than instancied plugin
            // todo use rootPath or need to resolve depth correctly !
            const localPluginPath = path__default["default"].join( __dirname, '../../../', 'databases/plugins/', name, `${ name }.js` );
            let plugin = require( localPluginPath );
            if(plugin.registerPlugin) {
                plugin = plugin.registerPlugin( config );
            }

            if ( plugin instanceof TAbstractDatabasePlugin ) {

                this.logger.log( `Use ${ name } plugin from local folder` );
                plugin.__dirname = path__default["default"].dirname( require.resolve( localPluginPath ) );
                plugin.registerTo( this.driver, this.application, this.router );

                success = true;

            } else {

                this.logger.error( `The plugin ${ name } doesn't seem to be an instance of an extended class from TAbstractDatabasePlugin ! Skip it.` );

            }

        } catch ( error ) {

            this.logger.error( error );

        }

        return success

    }

    connect () {}

    close ( /*callback*/ ) {}

    on ( /*eventName, callback*/ ) {}

}

/**
 * @module Messages/HTTP/BadRequestError
 * @desc Export the BadRequestError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class BadRequestError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 400
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 400 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isBadRequestError () { return true }

}

/**
 * @module Messages/HTTP/BadMappingError
 * @desc Export the BadMappingError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class BadMappingError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 421
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 421 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isBadMappingError () { return true }

}

/**
 * @module Messages/HTTP/BlockedByWindowsParentalControlsError
 * @desc Export the BlockedByWindowsParentalControlsError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class BlockedByWindowsParentalControlsError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 450
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 450 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isBlockedByWindowsParentalControlsError () { return true }

}

/**
 * @module Messages/HTTP/ClientClosedRequestError
 * @desc Export the ClientClosedRequestError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class ClientClosedRequestError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 499
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 499 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isClientClosedRequestError () { return true }

}

/**
 * @module Messages/HTTP/ConflictError
 * @desc Export the ConflictError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class ConflictError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 409
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 409 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isConflictError () { return true }

}

/**
 * @module Messages/HTTP/ExpectationFailedError
 * @desc Export the ExpectationFailedError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class ExpectationFailedError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 417
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 417 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isExpectationFailedError () { return true }

}

/**
 * @module Messages/HTTP/ForbiddenError
 * @desc Export the ForbiddenError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class ForbiddenError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 403
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 403 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isForbiddenError () { return true }

}

/**
 * @module Messages/HTTP/GoneError
 * @desc Export the GoneError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class GoneError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 410
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 410 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isGoneError () { return true }

}

/**
 * @module Messages/HTTP/HTTPRequestSentToHTTPSPortError
 * @desc Export the HTTPRequestSentToHTTPSPortError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class HTTPRequestSentToHTTPSPortError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 497
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 497 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isHTTPRequestSentToHTTPSPortError () { return true }

}

/**
 * @module Messages/HTTP/ImATeapotError
 * @desc Export the ImATeapotError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class ImATeapotError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 418
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 418 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isImATeapotError () { return true }

}

/**
 * @module Messages/HTTP/LengthRequiredError
 * @desc Export the LengthRequiredError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class LengthRequiredError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 411
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 411 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isLengthRequiredError () { return true }

}

/**
 * @module Messages/HTTP/LockedError
 * @desc Export the LockedError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class LockedError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 423
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 423 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isLockedError () { return true }

}

/**
 * @module Messages/HTTP/MethodFailureError
 * @desc Export the MethodFailureError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class MethodFailureError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 424
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 424 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isMethodFailureError () { return true }

}

/**
 * @module Messages/HTTP/MethodNotAllowedError
 * @desc Export the MethodNotAllowedError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class MethodNotAllowedError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 405
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 405 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isMethodNotAllowedError () { return true }

}

/**
 * @module Messages/HTTP/NoResponseError
 * @desc Export the NoResponseError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class NoResponseError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 444
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 444 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isNoResponseError () { return true }

}

/**
 * @module Messages/HTTP/NotAcceptableError
 * @desc Export the NotAcceptableError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class NotAcceptableError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 406
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 406 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isNotAcceptableError () { return true }

}

/**
 * @module Messages/HTTP/NotFoundError
 * @desc Export the NotFoundError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class NotFoundError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 404
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 404 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isNotFoundError () { return true }

}

/**
 * @module Messages/HTTP/PaymentRequiredError
 * @desc Export the PaymentRequiredError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class PaymentRequiredError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 402
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 402 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isPaymentRequiredError () { return true }

}

/**
 * @module Messages/HTTP/PreconditionFailedError
 * @desc Export the PreconditionFailedError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class PreconditionFailedError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 412
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 412 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isPreconditionFailedError () { return true }

}

/**
 * @module Messages/HTTP/PreconditionRequiredError
 * @desc Export the PreconditionRequiredError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class PreconditionRequiredError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 428
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 428 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isPreconditionRequiredError () { return true }

}

/**
 * @module Messages/HTTP/ProxyAuthenticationRequiredError
 * @desc Export the ProxyAuthenticationRequiredError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class ProxyAuthenticationRequiredError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 407
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 407 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isProxyAuthenticationRequiredError () { return true }

}

/**
 * @module Messages/HTTP/RequestEntityTooLargeError
 * @desc Export the RequestEntityTooLargeError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class RequestEntityTooLargeError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 413
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 413 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isRequestEntityTooLargeError () { return true }

}

/**
 * @module Messages/HTTP/RequestHeaderFieldsTooLargeError
 * @desc Export the RequestHeaderFieldsTooLargeError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class RequestHeaderFieldsTooLargeError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 431
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 431 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isRequestHeaderFieldsTooLargeError () { return true }

}

/**
 * @module Messages/HTTP/RequestRangeUnsatisfiableError
 * @desc Export the RequestRangeUnsatisfiableError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class RequestRangeUnsatisfiableError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 416
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 416 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isRequestRangeUnsatisfiableError () { return true }

}

/**
 * @module Messages/HTTP/RequestTimeOutError
 * @desc Export the RequestTimeOutError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class RequestTimeOutError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 408
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 408 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isRequestTimeOutError () { return true }

}

/**
 * @module Messages/HTTP/RetryWithError
 * @desc Export the RetryWithError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class RetryWithError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 449
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 449 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isRetryWithError () { return true }

}

/**
 * @module Messages/HTTP/SSLCertificateError
 * @desc Export the SSLCertificateError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class SSLCertificateError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 495
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 495 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isSSLCertificateError () { return true }

}

/**
 * @module Messages/HTTP/SSLCertificateRequiredError
 * @desc Export the SSLCertificateRequiredError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class SSLCertificateRequiredError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 496
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 496 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isSSLCertificateRequiredError () { return true }

}

/**
 * @module Messages/HTTP/TooManyRequestsError
 * @desc Export the TooManyRequestsError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class TooManyRequestsError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 429
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 429 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isTooManyRequestsError () { return true }

}

/**
 * @module Messages/HTTP/UnauthorizedError
 * @desc Export the UnauthorizedError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class UnauthorizedError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 401
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 401 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isUnauthorizedError () { return true }

}

/**
 * @module Messages/HTTP/UnavailableForLegalReasonsError
 * @desc Export the UnavailableForLegalReasonsError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class UnavailableForLegalReasonsError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 451
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 451 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isUnavailableForLegalReasonsError () { return true }

}

/**
 * @module Messages/HTTP/UnorderedCollectionError
 * @desc Export the UnorderedCollectionError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class UnorderedCollectionError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 425
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 425 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isUnorderedCollectionError () { return true }

}

/**
 * @module Messages/HTTP/UnrecoverableError
 * @desc Export the UnrecoverableError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class UnrecoverableError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 456
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 456 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isUnrecoverableError () { return true }

}

/**
 * @module Messages/HTTP/UpgradeRequiredError
 * @desc Export the UpgradeRequiredError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class UpgradeRequiredError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 426
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 426 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isUpgradeRequiredError () { return true }

}

/**
 * @module Messages/HTTP/ATimeoutOccuredError
 * @desc Export the ATimeoutOccuredError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class ATimeoutOccuredError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 524
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 524 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isATimeoutOccuredError () { return true }

}

/**
 * @module Messages/HTTP/BadGatewayError
 * @desc Export the BadGatewayError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class BadGatewayError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 502
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 502 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isBadGatewayError () { return true }

}

/**
 * @module Messages/HTTP/BandwidthLimitExceededError
 * @desc Export the BandwidthLimitExceededError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class BandwidthLimitExceededError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 509
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 509 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isBandwidthLimitExceededError () { return true }

}

/**
 * @module Messages/HTTP/ConnectionTimedOutError
 * @desc Export the ConnectionTimedOutError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class ConnectionTimedOutError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 522
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 522 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isConnectionTimedOutError () { return true }

}

/**
 * @module Messages/HTTP/GatewayTimeOutError
 * @desc Export the GatewayTimeOutError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class GatewayTimeOutError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 504
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 504 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isGatewayTimeOutError () { return true }

}

/**
 * @module Messages/HTTP/HTTPVersionNotSupportedError
 * @desc Export the HTTPVersionNotSupportedError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class HTTPVersionNotSupportedError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 505
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 505 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isHTTPVersionNotSupportedError () { return true }

}

/**
 * @module Messages/HTTP/InsufficientStorageError
 * @desc Export the InsufficientStorageError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class InsufficientStorageError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 507
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 507 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isInsufficientStorageError () { return true }

}

/**
 * @module Messages/HTTP/InternalServerError
 * @desc Export the InternalServerError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class InternalServerError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 500
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 500 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isInternalServerError () { return true }

}

/**
 * @module Messages/HTTP/InvalidSSLCertificateError
 * @desc Export the InvalidSSLCertificateError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class InvalidSSLCertificateError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 526
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 526 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isInvalidSSLCertificateError () { return true }

}

/**
 * @module Messages/HTTP/LoopDetectedError
 * @desc Export the LoopDetectedError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class LoopDetectedError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 508
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 508 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isLoopDetectedError () { return true }

}

/**
 * @module Messages/HTTP/NetworkAuthenticationRequiredError
 * @desc Export the NetworkAuthenticationRequiredError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class NetworkAuthenticationRequiredError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 511
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 511 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isNetworkAuthenticationRequiredError () { return true }

}

/**
 * @module Messages/HTTP/NotExtendedError
 * @desc Export the NotExtendedError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class NotExtendedError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 510
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 510 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isNotExtendedError () { return true }

}

/**
 * @module Messages/HTTP/NotImplementedError
 * @desc Export the NotImplementedError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class NotImplementedError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 501
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 501 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isNotImplementedError () { return true }

}

/**
 * @module Messages/HTTP/OriginIsUnreachableError
 * @desc Export the OriginIsUnreachableError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class OriginIsUnreachableError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 523
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 523 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isOriginIsUnreachableError () { return true }

}

/**
 * @module Messages/HTTP/RailgunError
 * @desc Export the RailgunError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class RailgunError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 527
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 527 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isRailgunError () { return true }

}

/**
 * @module Messages/HTTP/ServiceUnavailableError
 * @desc Export the ServiceUnavailableError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class ServiceUnavailableError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 503
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 503 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isServiceUnavailableError () { return true }

}

/**
 * @module Messages/HTTP/SSLHandshakeFailedError
 * @desc Export the SSLHandshakeFailedError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class SSLHandshakeFailedError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 525
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 525 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isSSLHandshakeFailedError () { return true }

}

/**
 * @module Messages/HTTP/VariantAlsoNegotiatesError
 * @desc Export the VariantAlsoNegotiatesError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class VariantAlsoNegotiatesError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 506
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 506 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isVariantAlsoNegotiatesError () { return true }

}

/**
 * @module Messages/HTTP/WebServerIsDownError
 * @desc Export the WebServerIsDownError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class WebServerIsDownError extends AbstractHTTPError {

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 521
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 521 }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isWebServerIsDownError () { return true }

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

const Databases = new Map();

exports.ATimeoutOccuredError = ATimeoutOccuredError;
exports.AbstractError = AbstractError;
exports.AbstractHTTPError = AbstractHTTPError;
exports.BadGatewayError = BadGatewayError;
exports.BadMappingError = BadMappingError;
exports.BadRequestError = BadRequestError;
exports.BandwidthLimitExceededError = BandwidthLimitExceededError;
exports.BlockedByWindowsParentalControlsError = BlockedByWindowsParentalControlsError;
exports.ClientClosedRequestError = ClientClosedRequestError;
exports.ConflictError = ConflictError;
exports.ConnectionTimedOutError = ConnectionTimedOutError;
exports.Databases = Databases;
exports.ExpectationFailedError = ExpectationFailedError;
exports.ForbiddenError = ForbiddenError;
exports.GatewayTimeOutError = GatewayTimeOutError;
exports.GoneError = GoneError;
exports.HTTPRequestSentToHTTPSPortError = HTTPRequestSentToHTTPSPortError;
exports.HTTPVersionNotSupportedError = HTTPVersionNotSupportedError;
exports.ImATeapotError = ImATeapotError;
exports.InsufficientStorageError = InsufficientStorageError;
exports.InternalServerError = InternalServerError;
exports.InvalidSSLCertificateError = InvalidSSLCertificateError;
exports.LengthRequiredError = LengthRequiredError;
exports.LockedError = LockedError;
exports.LoopDetectedError = LoopDetectedError;
exports.MemoryWriteStream = MemoryWriteStream;
exports.MethodFailureError = MethodFailureError;
exports.MethodNotAllowedError = MethodNotAllowedError;
exports.NetworkAuthenticationRequiredError = NetworkAuthenticationRequiredError;
exports.NoResponseError = NoResponseError;
exports.NotAcceptableError = NotAcceptableError;
exports.NotExtendedError = NotExtendedError;
exports.NotFoundError = NotFoundError;
exports.NotImplementedError = NotImplementedError;
exports.OriginIsUnreachableError = OriginIsUnreachableError;
exports.PaymentRequiredError = PaymentRequiredError;
exports.PreconditionFailedError = PreconditionFailedError;
exports.PreconditionRequiredError = PreconditionRequiredError;
exports.ProxyAuthenticationRequiredError = ProxyAuthenticationRequiredError;
exports.RailgunError = RailgunError;
exports.RequestEntityTooLargeError = RequestEntityTooLargeError;
exports.RequestHeaderFieldsTooLargeError = RequestHeaderFieldsTooLargeError;
exports.RequestRangeUnsatisfiableError = RequestRangeUnsatisfiableError;
exports.RequestTimeOutError = RequestTimeOutError;
exports.RetryWithError = RetryWithError;
exports.SSLCertificateError = SSLCertificateError;
exports.SSLCertificateRequiredError = SSLCertificateRequiredError;
exports.SSLHandshakeFailedError = SSLHandshakeFailedError;
exports.ServiceUnavailableError = ServiceUnavailableError;
exports.TAbstractConverterManager = TAbstractConverterManager;
exports.TAbstractDataController = TAbstractDataController;
exports.TAbstractDataConverter = TAbstractDataConverter;
exports.TAbstractDataInserter = TAbstractDataInserter;
exports.TAbstractDatabase = TAbstractDatabase;
exports.TAbstractDatabasePlugin = TAbstractDatabasePlugin;
exports.TAbstractFileConverter = TAbstractFileConverter;
exports.TAbstractResponder = TAbstractResponder;
exports.TooManyRequestsError = TooManyRequestsError;
exports.UnauthorizedError = UnauthorizedError;
exports.UnavailableForLegalReasonsError = UnavailableForLegalReasonsError;
exports.UnknownError = UnknownError;
exports.UnorderedCollectionError = UnorderedCollectionError;
exports.UnprocessableEntityError = UnprocessableEntityError;
exports.UnrecoverableError = UnrecoverableError;
exports.UpgradeRequiredError = UpgradeRequiredError;
exports.VariantAlsoNegotiatesError = VariantAlsoNegotiatesError;
exports.WebServerIsDownError = WebServerIsDownError;
//# sourceMappingURL=itee-database.cjs.js.map
