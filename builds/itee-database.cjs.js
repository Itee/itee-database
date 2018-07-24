'use strict';

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TDatabaseController
 * @classdesc The TDatabaseController is the base class to perform CRUD operations on the database
 */

const {
          isNullOrUndefined,
          isDefined,
          isArray,
          isNotEmptyArray,
          isNotEmptyObject
      } = require( 'itee-validators' );

const I = require( 'i-return' );

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

            I.returnError( {
                title:   'Erreur de paramètre',
                message: dataName + " n'existe pas dans les paramètres !"
            }, response );

        }
    }

    create ( request, response ) {

        const requestBody = request.body;
        if ( isNullOrUndefined( requestBody ) ) {

            I.returnError( {
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

                I.returnError( {
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

                I.returnError( {
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

                I.returnError( {
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

module.exports = TAbstractDataController;

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

class TAbstractFileConverter {

    constructor () {

        this.dumpType = 'arraybuffer'; // 'string', 'json'

        this._isProcessing = false;
        this._filesQueue   = [];
        this._fileData     = undefined;

    }

    convert ( file, parameters, onSuccess, onProgress, onError ) {

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

    }

    _processQueue () {

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

    }

    _releaseMemory () {

        this._fileData = null;

    }

    _convert ( parameters, onSuccess, onProgress, onError ) {

        console.error( '_convert: Need to be reimplemented in inherited class !' );

    }

}

TAbstractFileConverter.MAX_FILE_SIZE = 67108864;

module.exports = {
    MemoryWriteStream,
    TAbstractFileConverter
};

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

module.exports = TAbstractDatabase;

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const TAbstractDatabase$1 = require( './TAbstractDatabase' );
const driver            = require( 'mongoose' );

class TMongoDBDatabase extends TAbstractDatabase$1 {

    constructor ( app, router, plugins, parameters ) {

        super( driver, app, router, plugins, parameters );

        this.databaseUrl = parameters.databaseUrl;

    }

    _init () {}

    connect () {

        this._driver.connect( this.databaseUrl, {} );

    }

    close ( onCloseCallback ) {

        this._driver.connection.close( onCloseCallback );

    }

    on ( eventName, callback ) {

        const availableEventNames = [ 'connecting', 'connected', 'open', 'disconnecting', 'disconnected', 'reconnected', 'close', 'error' ];

        if ( availableEventNames.indexOf( eventName ) === -1 ) {
            return
        }

        this._driver.connection.on( eventName, callback );

    }

}

module.exports = TMongoDBDatabase;

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

    registerTo ( dbDriver ) {

    }

    addRoutesTo ( routes ) {

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

module.exports = TAbstractDatabasePlugin;

/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */
