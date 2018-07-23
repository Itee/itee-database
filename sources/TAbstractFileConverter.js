/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const fs           = require( 'fs' )
const { Writable } = require( 'stream' )
const globalBuffer = require( 'buffer' )

////////

/* Writable memory stream */
class MemoryWriteStream extends Writable {

    constructor ( options ) {

        super( options )

        const bufferSize  = options.bufferSize || globalBuffer.kStringMaxLength
        this.memoryBuffer = Buffer.alloc( bufferSize )
        this.offset       = 0
    }

    _write ( chunk, encoding, callback ) {

        // our memory store stores things in buffers
        const buffer = (Buffer.isBuffer( chunk )) ? chunk : new Buffer( chunk, encoding )

        // concat to the buffer already there
        for ( let byteIndex = 0, numberOfByte = buffer.length ; byteIndex < numberOfByte ; byteIndex++ ) {
            this.memoryBuffer[ this.offset ] = buffer[ byteIndex ]
            this.offset++
        }

        // Next
        callback()

    }

    _writev ( chunks, callback ) {

        for ( let chunkIndex = 0, numberOfChunks = chunks.length ; chunkIndex < numberOfChunks ; chunkIndex++ ) {
            this.memoryBuffer = Buffer.concat( [ this.memoryBuffer, chunks[ chunkIndex ] ] )
        }

        // Next
        callback()

    }

    _final ( callback ) {

        callback()

    }

    _releaseMemory () {

        this.memoryBuffer = null

    }

    ////

    toArrayBuffer () {

        const buffer      = this.memoryBuffer
        const arrayBuffer = new ArrayBuffer( buffer.length )
        const view        = new Uint8Array( arrayBuffer )

        for ( let i = 0 ; i < buffer.length ; ++i ) {
            view[ i ] = buffer[ i ]
        }

        this._releaseMemory()

        return arrayBuffer

    }

    toString () {

        const string = this.memoryBuffer.toString()
        this._releaseMemory()

        return string

    }

    toJSON () {

        return JSON.parse( this.toString() )

    }

}

////////

function FileToThreeBase () {
    'use strict'

    this.dumpType = 'arraybuffer' // 'string', 'json'

    this._isProcessing = false
    this._filesQueue   = []
    this._fileData     = undefined

}

FileToThreeBase.MAX_FILE_SIZE = 67108864

FileToThreeBase.prototype.convert = function convert ( file, parameters, onSuccess, onProgress, onError ) {

    this._filesQueue.push( {
        file,
        parameters,
        onSuccess,
        onProgress,
        onError
    } )

    if ( !this._isProcessing ) {
        this._processQueue()
    }

}

FileToThreeBase.prototype._processQueue = function _processQueue () {

    if ( this._filesQueue.length === 0 ) {

        this._isProcessing = false
        return

    }

    this._isProcessing = true

    const self              = this
    const fileData          = this._filesQueue.shift()
    const currentFile       = fileData.file
    const currentParameters = fileData.parameters
    const currentOnSuccess  = fileData.onSuccess
    const currentOnProgress = fileData.onProgress
    const currentOnError    = fileData.onError

    self._dumpFileInMemoryAs(
        this.dumpType,
        currentFile,
        currentParameters,
        _onDumpSuccess,
        _onProcessProgress,
        _onProcessError
    )

    function _onDumpSuccess ( data ) {

        self._fileData = data
        self._convert(
            currentParameters,
            _onProcessSuccess,
            _onProcessProgress,
            _onProcessError
        )

    }

    function _onProcessSuccess ( threeData ) {

        self._releaseMemory()
        currentOnSuccess( threeData )
        self._processQueue()

    }

    function _onProcessProgress ( progress ) {

        currentOnProgress( progress )

    }

    function _onProcessError ( error ) {

        currentOnError( error )
        self._processQueue()

    }

}

FileToThreeBase.prototype._dumpFileInMemoryAs = function ( dumpType, file, parameters, onSuccess, onProgress, onError ) {
    'use strict'

    let isOnError = false

    const fileReadStream = fs.createReadStream( file )

    fileReadStream.on( 'error', ( error ) => {
        console.error( `Read stream on error: ${error}` )

        isOnError = true
        onError( error )

    } )

    const fileSize          = parseInt(parameters.fileSize)
    const memoryWriteStream = new MemoryWriteStream( { bufferSize: fileSize } )

    memoryWriteStream.on( 'error', ( error ) => {

        isOnError = true
        onError( error )

    } )

    memoryWriteStream.on( 'finish', () => {

        if ( isOnError ) {
            return
        }

        switch ( dumpType ) {

            case 'arraybuffer':
                onSuccess( memoryWriteStream.toArrayBuffer() )
                break

            case 'string':
                onSuccess( memoryWriteStream.toString() )
                break

            case 'json':
                onSuccess( memoryWriteStream.toJSON() )
                break

            default:
                throw new RangeError( `Invalid switch parameter: ${dumpType}` )
                break

        }

        fileReadStream.unpipe()
        fileReadStream.close()
        memoryWriteStream.end()

    } )

    fileReadStream.pipe( memoryWriteStream )

}

FileToThreeBase.prototype._releaseMemory = function _releaseMemory () {

    this._fileData = null

}

FileToThreeBase.prototype._convert = function _convert ( parameters, onSuccess, onProgress, onError ) {

    console.error( '_convert: Need to be reimplemented in inherited class !' )

}

module.exports = FileToThreeBase
