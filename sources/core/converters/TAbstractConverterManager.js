/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import {
    isArray,
    isDefined,
    isFunction,
    isObject,
    isString
}           from 'itee-validators'
import path from 'path'

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
        let errorsList = []

        if ( isArray( error ) ) {

            for ( let i = 0, l = error.length ; i < l ; ++i ) {
                errorsList = errorsList.concat( TAbstractConverterManager._formatError( error[ i ] ) )
            }

        } else if ( isObject( error ) ) {

            if ( error.name === 'ValidationError' ) {

                let _message  = ''
                let subsError = error.errors

                for ( let property in subsError ) {
                    if ( !Object.prototype.hasOwnProperty.call( subsError, property ) ) { continue }
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

    static _convertFilesObjectToArray ( files ) {

        const fileArray = []

        for ( let field in files ) {

            if ( Object.prototype.hasOwnProperty.call( files, field ) ) {

                fileArray.push( files[ field ] )

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

        const formatedError = TAbstractConverterManager._formatError( error )

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
        }

        this._driver            = _parameters.driver
        this._useNext           = _parameters.useNext
        this._converters        = _parameters.converters
        this._convertersOptions = _parameters.convertersOptions
        this._rules             = _parameters.rules
        this._inserter          = new _parameters.inserter( {
            driver: this._driver
        } )

        this._errors         = []
        this._processedFiles = []
        this._filesToProcess = 0
    }

    _fileConversionSuccessCallback ( response, next, extraSuccessCallback, data ) {

        if ( extraSuccessCallback ) {
            extraSuccessCallback( data )
            return
        }

        this._inserter.save(
            data,
            this._convertersOptions,
            this._fileInsertionSuccessCallback.bind( this, response, next ),
            this._fileConversionProgressCallback.bind( this, response ),
            this._fileConversionErrorCallback.bind( this, response, next )
        )

    }

    _fileInsertionSuccessCallback ( response, next, data ) {

        this._filesToProcess--
        this._checkEndOfReturns( response, next, data )

    }

    _fileConversionProgressCallback ( response, progress ) {

        console.log( progress )

    }

    _fileConversionErrorCallback ( response, next, error ) {

        this._errors.push( error )
        this._filesToProcess--
        this._checkEndOfReturns( response, next, null )

    }

    _checkEndOfReturns ( response, next, data ) {

        if ( this._errors.length > 0 ) {

            if ( this._useNext ) {
                next( this._errors )
            } else {
                TAbstractConverterManager.return( response )( this._errors )
                this._errors = []
            }

        } else {
            if ( this._useNext ) {
                next()
            } else {
                TAbstractConverterManager.returnData( data, response )
            }
        }

    }

    processFiles ( request, response, next ) {

        const files             = TAbstractConverterManager._convertFilesObjectToArray( request.files )
        const numberOfFiles     = files.length
        this._convertersOptions = request.body

        // protect again multi-request from client on large file that take time to return response
        const availableFiles = []
        for ( let fileIndex = 0 ; fileIndex < numberOfFiles ; fileIndex++ ) {

            let file = files[ fileIndex ]

            if ( this._processedFiles.includes( file.name ) ) {

                if ( this._useNext ) {
                    next( `Le fichier ${file.name} à déjà été inséré.` )
                } else {
                    TAbstractConverterManager.returnError( `Le fichier ${file.name} à déjà été inséré.`, response )
                }

            }

            this._processedFiles.push( file.name )
            availableFiles.push( file )

        }

        const availableFilesNumber = availableFiles.length
        if ( availableFilesNumber === 0 ) {

            if ( this._useNext ) {
                next( `Impossible d'analyser ${availableFilesNumber} fichiers associatifs simultanément !` )
            } else {
                TAbstractConverterManager.returnError( `Impossible d'analyser ${availableFilesNumber} fichiers associatifs simultanément !`, response )
            }

        }

        this._filesToProcess += availableFilesNumber

        this._processFiles( availableFiles, this._convertersOptions, response, next )

    }

    _processFiles ( files, parameters, response, next ) {

        const fileExtensions = files.map( ( file ) => path.extname( file.name ) )
        const matchingRules  = this._rules.filter( elem => {

            const availables = elem.on

            if ( isArray( availables ) ) {

                for ( let i = 0 ; i < availables.length ; i++ ) {
                    if ( !fileExtensions.includes( availables[ i ] ) ) {
                        return false
                    }
                }
                return true

            } else {
                return fileExtensions.includes( availables )
            }

        } )

        for ( let ruleIndex = 0, numberOfRules = matchingRules.length ; ruleIndex < numberOfRules ; ruleIndex++ ) {
            let converterNames = matchingRules[ ruleIndex ].use

            if ( isArray( converterNames ) ) {

                let previousOnSucess = undefined
                for ( let converterIndex = converterNames.length - 1 ; converterIndex >= 0 ; converterIndex-- ) {
                    const converterName = converterNames[ converterIndex ]

                    if ( converterIndex === 0 ) {

                        this._converters[ converterName ].convert(
                            files,
                            parameters,
                            this._fileConversionSuccessCallback.bind( this, response, next, previousOnSucess ),
                            this._fileConversionProgressCallback.bind( this, response ),
                            this._fileConversionErrorCallback.bind( this, response, next )
                        )

                    } else if ( converterIndex === converterNames.length - 1 ) {

                        previousOnSucess = ( previousResult ) => {

                            this._converters[ converterName ].convert(
                                previousResult,
                                parameters,
                                this._fileConversionSuccessCallback.bind( this, response, next, null ),
                                this._fileConversionProgressCallback.bind( this, response ),
                                this._fileConversionErrorCallback.bind( this, response, next )
                            )

                        }

                    } else {

                        previousOnSucess = ( previousResult ) => {

                            this._converters[ converterName ].convert(
                                previousResult,
                                parameters,
                                this._fileConversionSuccessCallback.bind( this, response, next, previousOnSucess ),
                                this._fileConversionProgressCallback.bind( this, response ),
                                this._fileConversionErrorCallback.bind( this, response, next )
                            )

                        }

                    }

                }

            } else {

                this._converters[ converterNames ].convert(
                    files[ 0 ],
                    parameters,
                    this._fileConversionSuccessCallback.bind( this, response, next, null ),
                    this._fileConversionProgressCallback.bind( this, response ),
                    this._fileConversionErrorCallback.bind( this, response, next )
                )

            }

        }

    }

}

export { TAbstractConverterManager }
