/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 */

import { isArray }            from 'itee-validators'
import path                   from 'path'
import { TAbstractResponder } from '../databases/TAbstractResponder'

// Todo: Extend sort of Factory
class TAbstractConverterManager extends TAbstractResponder {

    static _convertFilesObjectToArray ( files ) {

        const fileArray = []

        for ( let field in files ) {

            if ( Object.prototype.hasOwnProperty.call( files, field ) ) {

                fileArray.push( files[ field ] )

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
        }

        super()

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

        const files         = TAbstractConverterManager._convertFilesObjectToArray( request.files )
        const numberOfFiles = files.length
        if ( numberOfFiles === 0 ) {

            if ( this._useNext ) {
                next( `Aucun fichier à traiter !` )
                return
            } else {
                TAbstractConverterManager.returnError( `Aucun fichier à traiter !`, response )
            }

        }

        this._convertersOptions = request.body

        // protect again multi-request from client on large file that take time to return response
        const availableFiles = []
        for ( let fileIndex = 0 ; fileIndex < numberOfFiles ; fileIndex++ ) {

            let file = files[ fileIndex ]

            if ( this._processedFiles.includes( file.name ) ) {

                if ( this._useNext ) {
                    next( `Le fichier ${ file.name } à déjà été inséré.` )
                    return
                } else {
                    TAbstractConverterManager.returnError( `Le fichier ${ file.name } à déjà été inséré.`, response )
                }

            }

            this._processedFiles.push( file.name )
            availableFiles.push( file )

        }

        const availableFilesNumber = availableFiles.length
        if ( availableFilesNumber === 0 ) {

            if ( this._useNext ) {
                next( `Impossible d'analyser ${ availableFilesNumber } fichiers associatifs simultanément !` )
                return
            } else {
                TAbstractConverterManager.returnError( `Impossible d'analyser ${ availableFilesNumber } fichiers associatifs simultanément !`, response )
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
