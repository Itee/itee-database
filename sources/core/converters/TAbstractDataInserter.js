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
        }

        this._driver = _parameters.driver

        this._isProcessing = false
        this._queue        = []

    }

    save ( data, parameters, onSuccess, onProgress, onError ) {

        if ( !data ) {
            onError( 'Data cannot be null or empty, aborting database insert !!!' )
            return
        }

        if ( !parameters ) {
            onError( 'Invalid parent id, unable to set children to unknown database node !!!' )
            return
        }

        this._queue.push( {
            data,
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
        const data       = dataBloc.data
        const parameters = dataBloc.parameters
        const onSuccess  = dataBloc.onSuccess
        const onProgress = dataBloc.onProgress
        const onError    = dataBloc.onError

        self._save(
            data,
            parameters,
            _onSaveSuccess,
            _onSaveProgress,
            _onSaveError
        )

        function _onSaveSuccess ( result ) {

            onSuccess( result )

            self._isProcessing = false
            self._processQueue()

        }

        function _onSaveProgress ( progress ) {

            onProgress( progress )

        }

        function _onSaveError ( error ) {

            onError( error )

            self._isProcessing = false
            self._processQueue()

        }

    }

    _save ( data, parameters, onSuccess, onProgress, onError ) {}

}

export { TAbstractDataInserter }
