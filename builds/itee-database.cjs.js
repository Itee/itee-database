'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

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

    constructor ( driver, application, router, plugins = [], autoReconnectTimeout = 10000 ) {

        this.routes = {};

        this._driver               = driver;
        this._application          = application;
        this._router               = router;
        this._plugins              = plugins;
        this._autoReconnectTimeout = autoReconnectTimeout;
        this._autoConnectionTimer  = null;

        this.__init();

    }

    __init () {

        // Register modules plugins
        const pluginsNames = this._plugins;
        for ( let index = 0, numberOfPlugins = pluginsNames.length ; index < numberOfPlugins ; index++ ) {

            const pluginName = pluginsNames[ index ];
            let plugin       = undefined;

            try {
                plugin = require( pluginName );
            } catch ( error ) {
                console.error( `Unable to register plugin ${pluginName} the package doesn't seem to exist ! Skip it.` );
                continue
            }

            plugin.registerTo( this._driver, this._application, this._router );

        }

        this._init();

    }

    _init () {

        console.error( 'TAbstractDatabase._init: Need to be reimplemented in inherited class !' );

    }

    connect () {

        console.error( 'TAbstractDatabase.connect: Need to be reimplemented in inherited class !' );

    }

    /**
     * startAutoConnect
     */
    startAutoConnect () {
        if ( this._autoConnectionTimer ) {
            return
        }

        this._autoConnectionTimer = setInterval( this.connect.bind( this ), this._autoReconnectTimeout );
    }

    /**
     * stopAutoConnect
     */
    stopAutoConnect () {
        if ( !this._autoConnectionTimer ) {
            return
        }

        clearInterval( this._autoConnectionTimer );
        this._autoConnectionTimer = null;
    }

    close ( callback ) {

        console.error( 'TAbstractDatabase.close: Need to be reimplemented in inherited class !' );

    }

    on ( eventName, callback ) {

        console.error( 'TAbstractDatabase.on: Need to be reimplemented in inherited class !' );

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

class TAbstractDatabasePlugin {

    constructor ( parameters ) {

        this.routes = {};

    }

    registerTo( dbDriver ) {

    }

    addRoutesTo( routes ) {

        let _routes = routes;

        for ( let routeKey in this.routes ) {

            if ( _routes[ routeKey ] ) {
                console.warn( `Route controller for key ${routeKey} already exist, ignore it !` );
                continue
            }

            _routes[ routeKey ] = this.routes[ routeKey ];

        }

        return _routes

    }

}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [MIT]{@link https://opensource.org/licenses/MIT}
 *
 * @module sources/cores/voids
 * @desc Export the validation methods about voids notions
 */

/**
 * Check if given data is not null
 *
 * @param data {any} The data to check against the nullity
 * @returns {boolean} true if data is not null, false otherwise.
 */
function isNotNull ( data ) {
    return (data !== null)
}

/**
 * Check if given data is null or undefined
 *
 * @param data {any} The data to check against the existence
 * @returns {boolean} true if data is null or undefined, false otherwise.
 */
function isNullOrUndefined ( data ) {
    return ((data === null) || (typeof data === 'undefined'))
}

/**
 * Check if given data is not null and not undefined
 *
 * @param data {any} The data to check against the existence
 * @returns {boolean} true if data is not null and not undefined, false otherwise.
 */
function isDefined ( data ) {
    return ((data !== null) && (typeof data !== 'undefined'))
}

/**
 * Check emptiness of given data
 *
 * See: https://stackoverflow.com/questions/4346186/how-to-determine-if-a-function-is-empty
 *
 * @param data {any} The data to check against the emptiness
 * @returns {boolean} true if data is considered as empty, false otherwise.
 */
function isEmpty ( data ) {

    // null and undefined are consider as "empty"
    if ( data === null ) {
        return true;
    }
    if ( data === undefined ) {
        return true;
    }

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if ( data.length > 0 ) {
        return false;
    }
    if ( data.length === 0 ) {
        return true;
    }

    // Otherwise, does it have any properties of its own?
    for ( let key in data ) {
        if ( Object.prototype.hasOwnProperty.call( data, key ) ) {
            return false;
        }
    }

    return true;
}

/**
 * Check fullness of given data
 *
 * @param data {any} The data to check against the emptiness
 * @returns {boolean} true if data is considered as not empty, false otherwise.
 */
function isNotEmpty ( data ) {
    return !isEmpty( data );
}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [MIT]{@link https://opensource.org/licenses/MIT}
 *
 * @module sources/cores/objects
 * @desc Export the validation methods about objects
 * @requires {@link module:sources/cores/voids/isNull}
 * @requires {@link module:sources/cores/voids/isEmpty}
 */

/**
 * Check if given data is an object
 *
 * @param data {any} The data to check against the object type
 * @returns {boolean} true if data is object, false otherwise
 */
function isObject ( data ) {
    return ( isNotNull( data ) && (typeof data === 'object') && !Array.isArray( data ) )
}

/**
 * Check if given data is not an empty object
 *
 * @param data {any} The data to check against the emptiness of the object
 * @returns {boolean} true if data is not an empty object, false otherwise
 */
function isNotEmptyObject ( data ) {
    return ( isObject( data ) && isNotEmpty( data ) )
}

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [MIT]{@link https://opensource.org/licenses/MIT}
 *
 * @module sources/cores/arrays
 * @desc Export the validation methods about Arrays
 * @requires {@link module:sources/cores/voids}
 * @requires {@link module:sources/cores/strings}
 * @requires {@link module:sources/cores/objects}
 *
 */

/**
 * Check if given data is an array
 *
 * @param data {any} The data to check against the array type
 * @returns {boolean} true if data is array, false otherwise
 */
function isArray ( data ) {
    return Array.isArray( data )
}

/**
 * Check if given data is not an empty array
 *
 * @param data {any} The data to check against the empty array
 * @returns {boolean} true if data is not an empty array, false otherwise
 */
function isNotEmptyArray ( data ) {
    return ( isArray( data ) && isNotEmpty( data ) )
}

/*
 MIT License

 Copyright (c) 2016 Tristan VALCKE

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

/**
 * This module allow to send response to user in an automatically way after requesting the mongodb database (if no options was provide),
 * and allow to handle every step on response return, and data/error state.
 * @module I-Return
 *
 * @author Tristan Valcke <https://github.com/TristanVALCKE>
 * @license MIT
 *
 */

// Helpers
/**
 * String discrimination function
 *
 * @param {*} variable - The variable to check
 * @returns {boolean} True if variable is a string, false otherwise
 * @private
 * @static
 */
function _isString (variable) {
  return (typeof variable === 'string' || variable instanceof String)
}

/**
 * Filled array discrimination function
 *
 * @param {*} variable - The variable to check
 * @returns {boolean} True if variable is an array containing values, false otherwise
 * @private
 * @static
 */
function _isNullOrEmptyArray (variable) {
  return (!variable || (variable.constructor === Array && variable.length === 0))
}

/**
 * Array discrimination function
 *
 * @param {*} variable - The variable to check
 * @returns {boolean} True if variable is a array, false otherwise
 * @private
 * @static
 */
function _isArray (variable) {
  return (variable.constructor === Array)
}

/**
 * Object discrimination function
 *
 * @param {*} variable - The variable to check
 * @returns {boolean} True if variable is a object, false otherwise
 * @private
 * @static
 */
function _isObject (variable) {
  return (variable === Object(variable))
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
function _normalizeError (error) {
  var errorsList = [];

  if (_isArray(error)) {

    for (var i = 0, l = error.length; i < l; ++i) {
      errorsList = errorsList.concat(_normalizeError(error[ i ]));
    }

  } else if (_isObject(error)) {

    if (error.name === 'ValidationError') {

      var _message  = '';
      var subsError = error.errors;

      for (var property in subsError) {
        if (subsError.hasOwnProperty(property)) {
          _message += subsError[ property ].message + '<br>';
        }
      }

      errorsList.push({
        title:   'Erreur de validation',
        message: _message || 'Aucun message d\'erreur... Gloups !'
      });

    } else if (error.name === 'VersionError') {

      errorsList.push({
        title:   'Erreur de base de donnée',
        message: 'Aucun document correspondant n\'as put être trouvé pour la requete !'
      });

    } else {

      errorsList.push({
        title:   error.title || 'Erreur',
        message: error.message || 'Aucun message d\'erreur... Gloups !'
      });
      
    }

  } else if (_isString(error)) {

    errorsList.push({
      title:   'Erreur',
      message: error
    });

  } else {

    throw new Error('Unknown error type: ' + error + ', please report your issue at "https://github.com/TristanVALCKE/i-return/issues"')

  }

  return errorsList
}

// API
/**
 * In case database call return nothing consider that is a not found.
 * If response parameter is a function consider this is a returnNotFound callback function to call,
 * else check if server response headers aren't send yet, and return response with status 204
 *
 * @param response - The server response or returnNotFound callback
 * @returns {*} callback call or response with status 204
 */
function returnNotFound (response) {
  if (typeof (response) === 'function') {
    return response()
  }

  if (!response.headersSent) {
    return response.status(204).end()
  }
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
function returnError (error, response) {
  if (typeof (response) === 'function') {
    return response(error, null)
  }

  if (!response.headersSent) {
    return response.status(500).end(JSON.stringify(error))
  }
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
function returnData (data, response) {
  if (typeof (response) === 'function') {
    return response(null, data)
  }

  if (!response.headersSent) {
    return response.status(200).end(JSON.stringify(data))
  }
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
function returnErrorAndData (error, data, response) {
  if (typeof (response) === 'function') {
    return response(error, data)
  }

  if (!response.headersSent) {
    return response.status(406).end(JSON.stringify({
      errors: error,
      data:   data
    }))
  }
}

/**
 * The main entry point of this module.
 * This function will be used as database callback and will call given handlers if they were set,
 * and redirect server response in an automatic way (if not handlers) in function of the database response type (nothing, data, error, data and error).
 *
 * Callback are in the form:
 *
 * @example <caption>Available callback are:</caption>
 * {
   *   beforeAll:    null,
   *   returnForAll: null,
   *   afterAll:     null,
   *
   *   beforeReturnErrorAndData: null,
   *   returnErrorAndData:       returnErrorAndData,
   *   afterReturnErrorAndData:  null,
   *
   *   beforeReturnError: null,
   *   returnError:       returnError,
   *   afterReturnError:  null,
   *
   *   beforeReturnData: null,
   *   returnData:       returnData,
   *   afterReturnData:  null,
   *
   *   beforeReturnNotFound: null,
   *   returnNotFound:       returnNotFound,
   *   afterReturnNotFound:  null
   * }
 *
 * @param response - The server response to return to end user
 * @param {Object} userCallbacks - A literal object containing returnMethod override or handler
 * @returns {Function} The provided database callback
 */
function returnResponse (response, userCallbacks) {
  var _userCallbacks = userCallbacks || {};
  var _cb            = {
    beforeAll:    null,
    returnForAll: null,
    afterAll:     null,

    beforeReturnErrorAndData: null,
    returnErrorAndData:       returnErrorAndData,
    afterReturnErrorAndData:  null,

    beforeReturnError: null,
    returnError:       returnError,
    afterReturnError:  null,

    beforeReturnData: null,
    returnData:       returnData,
    afterReturnData:  null,

    beforeReturnNotFound: null,
    returnNotFound:       returnNotFound,
    afterReturnNotFound:  null
  };

  /**
   * Register user callback
   */
  for (var callback in _userCallbacks) {
    if (_userCallbacks.hasOwnProperty(callback) && _cb.hasOwnProperty(callback)) {
      _cb[ callback ] = _userCallbacks[ callback ];
    }
  }

  /**
   * Call provided callback for error and data case.
   *
   * @param error - The database receive error
   * @param data - The database retrieved data
   */
  function processErrorAndData (error, data) {
    if (_cb.beforeReturnErrorAndData) { _cb.beforeReturnErrorAndData(error, data); }
    if (_cb.returnErrorAndData) { _cb.returnErrorAndData(error, data, response); }
    if (_cb.afterReturnErrorAndData) { _cb.afterReturnErrorAndData(error, data); }
  }

  /**
   * Call provided callback for error case.
   *
   * @param error - The database receive error
   */
  function processError (error) {
    if (_cb.beforeReturnError) { _cb.beforeReturnError(error); }
    if (_cb.returnError) { _cb.returnError(error, response); }
    if (_cb.afterReturnError) { _cb.afterReturnError(error); }
  }

  /**
   * Call provided callback for data case.
   *
   * @param data - The database retrieved data
   */
  function processData (data) {
    if (_cb.beforeReturnData) { _cb.beforeReturnData(data); }
    if (_cb.returnData) { _cb.returnData(data, response); }
    if (_cb.afterReturnData) { _cb.afterReturnData(data); }
  }

  /**
   * Call provided callback for not found data case.
   */
  function processNotFound () {
    if (_cb.beforeReturnNotFound) { _cb.beforeReturnNotFound(); }
    if (_cb.returnNotFound) { _cb.returnNotFound(response); }
    if (_cb.afterReturnNotFound) { _cb.afterReturnNotFound(); }
  }

  /**
   * The callback that will be used for parse database response
   */
  function dispatchResult (error, data) {
    if (_cb.beforeAll) { _cb.beforeAll(); }

    if (_cb.returnForAll) {
      _cb.returnForAll(error, data);
    } else if (!_isNullOrEmptyArray(error)) {
      var _error = _normalizeError(error);
      if (!_isNullOrEmptyArray(data)) {
        processErrorAndData(_error, data);
      } else {
        processError(_error);
      }
    } else {
      if (!_isNullOrEmptyArray(data)) {
        processData(data);
      } else {
        processNotFound();
      }
    }

    if (_cb.afterAll) { _cb.afterAll(); }
  }

  return dispatchResult
}

var iReturn = {
  return:             returnResponse,
  returnError:        returnError,
  returnNotFound:     returnNotFound,
  returnData:         returnData,
  returnErrorAndData: returnErrorAndData
};

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TDatabaseController
 * @classdesc The TDatabaseController is the base class to perform CRUD operations on the database
 */

class TAbstractDataController {

    constructor ( parameters ) {

        this._parameters = parameters;

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

        const body = request.body;
        const params = request.params;
        const query = request.query;

        if ( isDefined(body) && body[ dataName ] ) {

            return body[ dataName ]

        } else if ( isDefined(params) && params[ dataName ] ) {

            return params[ dataName ]

        } else if ( isDefined(query) && query[ dataName ] ) {

            return query[ dataName ]

        } else {

            iReturn.returnError( {
                title:   'Erreur de paramètre',
                message: dataName + " n'existe pas dans les paramètres !"
            }, response );

        }
    }

    create ( request, response ) {

        const requestBody = request.body;
        if ( isNullOrUndefined( requestBody ) ) {

            iReturn.returnError( {
                title:   'Erreur de paramètre',
                message: 'Aucun paramètre n\'a été reçu !'
            }, response );
            return

        }

        if ( isArray( requestBody ) ) {

            this._createSome( requestBody, response );

        } else {

            this._createOne( requestBody, response );

        }

    }

    _createOne ( data, response ) {}

    _createSome ( datas, response ) {}

    read ( request, response ) {

        const requestBody = request.body;
        const idParam     = request.params[ 'id' ];

        response.set( "Content-Type", "application/json" );

        if ( isDefined( requestBody ) ) {

            if ( isNotEmptyObject( requestBody ) ) {

                this._readByObject( requestBody, response );

            } else if ( isNotEmptyArray( requestBody ) ) {

                this._readByArray( requestBody, response );

            } else {

                iReturn.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requête ne contient pas de données !'
                }, response );

            }

        } else if ( isDefined( idParam ) ) {

            this._readById( idParam, response );

        } else {

            this._readAll( response );

        }

    }

    _readById ( id, response ) {}

    _readByArray ( array, response ) {}

    _readByObject ( object, response ) {}

    _readAll ( response ) {}

    update ( request, response ) {

        const requestBody = request.body;
        const idParam     = request.params[ 'id' ];

        if ( isDefined( requestBody ) ) {

            if ( isNotEmptyObject( requestBody ) ) {

                this._updateByObject( requestBody, response );

            } else if ( isNotEmptyArray( requestBody ) ) {

                this._updateByArray( requestBody, response );

            } else {

                iReturn.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requête ne contient pas de données !'
                }, response );

            }

        } else if ( isDefined( idParam ) ) {

            this._updateById( idParam, response );

        } else {

            this._updateAll( response );

        }

    }

    _updateById ( id, response ) {}

    _updateByArray ( array, response ) {}

    _updateByObject ( object, response ) {}

    _updateAll ( response ) {}

    delete ( request, response ) {

        const requestBody = request.body;
        const idParam     = request.params[ 'id' ];

        if ( isDefined( requestBody ) ) {

            if ( isNotEmptyObject( requestBody ) ) {

                this._deleteByObject( requestBody, response );

            } else if ( isNotEmptyArray( requestBody ) ) {

                this._deleteByArray( requestBody, response );

            } else {

                iReturn.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requête ne contient pas de données !'
                }, response );

            }

        } else if ( isDefined( idParam ) ) {

            this._deleteById( idParam, response );

        } else {

            this._deleteAll( response );

        }

    }

    _deleteById ( id, response ) {}

    _deleteByArray ( array, response ) {}

    _deleteByObject ( object, response ) {}

    _deleteAll ( response ) {}

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

const fs           = require( 'fs' );
const { Writable } = require( 'stream' );
const globalBuffer = require( 'buffer' );

////////

/* Writable memory stream */
class MemoryWriteStream extends Writable {

    constructor ( options ) {

        super( options );

        const bufferSize  = options.bufferSize || globalBuffer.kStringMaxLength;
        this.memoryBuffer = Buffer.alloc( bufferSize );
        this.offset       = 0;
    }

    _write ( chunk, encoding, callback ) {

        // our memory store stores things in buffers
        const buffer = (Buffer.isBuffer( chunk )) ? chunk : new Buffer( chunk, encoding );

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

    _final ( callback ) {

        callback();

    }

    _releaseMemory () {

        this.memoryBuffer = null;

    }

    ////

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

    toString () {

        const string = this.memoryBuffer.toString();
        this._releaseMemory();

        return string

    }

    toJSON () {

        return JSON.parse( this.toString() )

    }

}

////////

function TAbstractFileConverter () {

    this.dumpType = 'arraybuffer'; // 'string', 'json'

    this._isProcessing = false;
    this._filesQueue   = [];
    this._fileData     = undefined;

}

TAbstractFileConverter.MAX_FILE_SIZE = 67108864;

TAbstractFileConverter.prototype.convert = function convert ( file, parameters, onSuccess, onProgress, onError ) {

    this._filesQueue.push( {
        file,
        parameters,
        onSuccess,
        onProgress,
        onError
    } );

    if ( !this._isProcessing ) {
        this._processQueue();
    }

};

TAbstractFileConverter.prototype._processQueue = function _processQueue () {

    if ( this._filesQueue.length === 0 ) {

        this._isProcessing = false;
        return

    }

    this._isProcessing = true;

    const self              = this;
    const fileData          = this._filesQueue.shift();
    const currentFile       = fileData.file;
    const currentParameters = fileData.parameters;
    const currentOnSuccess  = fileData.onSuccess;
    const currentOnProgress = fileData.onProgress;
    const currentOnError    = fileData.onError;

    self._dumpFileInMemoryAs(
        this.dumpType,
        currentFile,
        currentParameters,
        _onDumpSuccess,
        _onProcessProgress,
        _onProcessError
    );

    function _onDumpSuccess ( data ) {

        self._fileData = data;
        self._convert(
            currentParameters,
            _onProcessSuccess,
            _onProcessProgress,
            _onProcessError
        );

    }

    function _onProcessSuccess ( threeData ) {

        self._releaseMemory();
        currentOnSuccess( threeData );
        self._processQueue();

    }

    function _onProcessProgress ( progress ) {

        currentOnProgress( progress );

    }

    function _onProcessError ( error ) {

        currentOnError( error );
        self._processQueue();

    }

};

TAbstractFileConverter.prototype._dumpFileInMemoryAs = function ( dumpType, file, parameters, onSuccess, onProgress, onError ) {

    let isOnError = false;

    const fileReadStream = fs.createReadStream( file );

    fileReadStream.on( 'error', ( error ) => {
        console.error( `Read stream on error: ${error}` );

        isOnError = true;
        onError( error );

    } );

    const fileSize          = parseInt(parameters.fileSize);
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

            case 'arraybuffer':
                onSuccess( memoryWriteStream.toArrayBuffer() );
                break

            case 'string':
                onSuccess( memoryWriteStream.toString() );
                break

            case 'json':
                onSuccess( memoryWriteStream.toJSON() );
                break

            default:
                throw new RangeError( `Invalid switch parameter: ${dumpType}` )
                break

        }

        fileReadStream.unpipe();
        fileReadStream.close();
        memoryWriteStream.end();

    } );

    fileReadStream.pipe( memoryWriteStream );

};

TAbstractFileConverter.prototype._releaseMemory = function _releaseMemory () {

    this._fileData = null;

};

TAbstractFileConverter.prototype._convert = function _convert ( parameters, onSuccess, onProgress, onError ) {

    console.error( '_convert: Need to be reimplemented in inherited class !' );

};

module.exports = TAbstractFileConverter;

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

exports.TAbstractDatabase = TAbstractDatabase;
exports.TAbstractDatabasePlugin = TAbstractDatabasePlugin;
exports.TAbstractDataController = TAbstractDataController;
