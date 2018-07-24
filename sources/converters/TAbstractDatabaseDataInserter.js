/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TAbstractDatabaseDataInserter {

    constructor ( driver ) {

        this._driver       = driver
        this._isProcessing = false
        this._filesQueue   = []
        this._fileData     = undefined

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

        this._filesQueue.push( {
            data,
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

        if ( this._filesQueue.length === 0 ) {

            this._isProcessing = false
            return

        }

        this._isProcessing = true

        const self       = this
        const fileData   = this._filesQueue.shift()
        const data       = fileData.data
        const parameters = fileData.parameters
        const onSuccess  = fileData.onSuccess
        const onProgress = fileData.onProgress
        const onError    = fileData.onError

        self._save(
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

    _save ( data, parameters, onSuccess, onProgress, onError ) {

        console.error( "TAbstractDatabaseDataProvider: _save method need to be reimplemented !" )

    }

}

module.exports = TAbstractDatabaseDataInserter
