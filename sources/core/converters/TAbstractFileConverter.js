/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import * as globalBuffer from 'buffer'
import fs                from 'fs'
import {
    isNull,
    isUndefined
}                        from 'itee-validators'
import { Writable }      from 'stream'

/* Writable memory stream */
class MemoryWriteStream extends Writable {

    constructor ( options ) {

        super( options )

        const bufferSize  = options.bufferSize || globalBuffer.kStringMaxLength
        this.memoryBuffer = Buffer.alloc( bufferSize )
        this.offset       = 0
    }

    toString () {

        const string = this.memoryBuffer.toString()
        this._releaseMemory()

        return string

    }

    _final ( callback ) {

        callback()

    }

    _write ( chunk, encoding, callback ) {

        // our memory store stores things in buffers
        const buffer = ( Buffer.isBuffer( chunk ) ) ? chunk : new Buffer( chunk, encoding )

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

    ////

    _releaseMemory () {

        this.memoryBuffer = null

    }

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
        }

        this.dumpType = _parameters.dumpType

        this._isProcessing = false
        this._queue        = []

    }

    get dumpType () {

        return this._dumpType

    }

    set dumpType ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Dump type cannot be null ! Expect a non empty string.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Dump type cannot be undefined ! Expect a non empty string.' ) }

        this._dumpType = value

    }

    setDumpType ( value ) {

        this.dumpType = value
        return this

    }

    convert ( file, parameters, onSuccess, onProgress, onError ) {

        if ( !file ) {
            onError( 'File cannot be null or empty, aborting file convertion !!!' )
            return
        }

        this._queue.push( {
            file,
            parameters,
            onSuccess,
            onProgress,
            onError
        } )

        this._processQueue()

    }

    _processQueue () {

        if ( this._queue.length === 0 || this._isProcessing ) { return }

        this._isProcessing = true

        const self       = this
        const dataBloc   = this._queue.shift()
        const data       = dataBloc.file
        const parameters = dataBloc.parameters
        const onSuccess  = dataBloc.onSuccess
        const onProgress = dataBloc.onProgress
        const onError    = dataBloc.onError

        self._dumpFileInMemoryAs(
            self._dumpType,
            data,
            parameters,
            _onDumpSuccess,
            _onProcessProgress,
            _onProcessError
        )

        function _onDumpSuccess ( data ) {

            self._convert(
                data,
                parameters,
                _onProcessSuccess,
                _onProcessProgress,
                _onProcessError
            )

        }

        function _onProcessSuccess ( threeData ) {

            onSuccess( threeData )

            self._isProcessing = false
            self._processQueue()

        }

        function _onProcessProgress ( progress ) {

            onProgress( progress )

        }

        function _onProcessError ( error ) {

            onError( error )

            self._isProcessing = false
            self._processQueue()

        }

    }

    _dumpFileInMemoryAs ( dumpType, file, parameters, onSuccess, onProgress, onError ) {

        let isOnError = false

        const fileReadStream = fs.createReadStream( file )

        fileReadStream.on( 'error', ( error ) => {
            console.error( `Read stream on error: ${error}` )

            isOnError = true
            onError( error )

        } )

        const fileSize          = parseInt( parameters.fileSize )
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

                case TAbstractFileConverter.DumpType.ArrayBuffer:
                    onSuccess( memoryWriteStream.toArrayBuffer() )
                    break

                case TAbstractFileConverter.DumpType.String:
                    onSuccess( memoryWriteStream.toString() )
                    break

                case TAbstractFileConverter.DumpType.JSON:
                    onSuccess( memoryWriteStream.toJSON() )
                    break

                default:
                    throw new RangeError( `Invalid switch parameter: ${dumpType}` )

            }

            fileReadStream.unpipe()
            fileReadStream.close()
            memoryWriteStream.end()

        } )

        fileReadStream.pipe( memoryWriteStream )

    }

    _convert ( /*data, parameters, onSuccess, onProgress, onError*/ ) {}

}

TAbstractFileConverter.MAX_FILE_SIZE = 67108864

TAbstractFileConverter.DumpType = Object.freeze( {
    ArrayBuffer: 0,
    String:      1,
    JSON:        2
} )

export {
    TAbstractFileConverter,
    MemoryWriteStream
}
