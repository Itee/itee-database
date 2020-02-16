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

        this._isProcessing = false
        this._queue        = []

    }

    convert ( file, parameters, onSuccess, onProgress, onError ) {

        this._queue.push( {
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

    _processQueue () {

        if ( this._queue.length === 0 ) {

            this._isProcessing = false
            return

        }

        this._isProcessing = true

        const self       = this
        const dataBloc   = this._queue.shift()
        const data       = dataBloc.file
        const parameters = dataBloc.parameters
        const onSuccess  = dataBloc.onSuccess
        const onProgress = dataBloc.onProgress
        const onError    = dataBloc.onError

        self._convert(
            data,
            parameters,
            _onSaveSuccess,
            _onSaveProgress,
            _onSaveError
        )

        function _onSaveSuccess ( result ) {

            onSuccess( result )
            self._processQueue()

        }

        function _onSaveProgress ( progress ) {

            onProgress( progress )

        }

        function _onSaveError ( error ) {

            onError( error )
            self._processQueue()

        }

    }

    _convert ( /*data, parameters, onSuccess, onProgress, onError*/ ) {}

}

export { TAbstractDataConverter }
