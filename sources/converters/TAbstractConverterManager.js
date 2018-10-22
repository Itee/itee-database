/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const I    = require( 'i-return' )
const path = require( 'path' )

// Todo: Extend sort of Factory
class TAbstractConverterManager {

    constructor ( Driver, options ) {

        this._useNext           = options.useNext || false
        this._converters        = options.converters || {}
        this._convertersOptions = undefined
        this._rules             = options.rules || {}
        this._inserter          = new options.inserter( Driver ) || {}

        this._errors                = []
        this._processedFiles        = []

    }

    static _convertFilesObjectToArray ( files ) {

        const fileArray = []

        for ( let field in files ) {

            if ( files.hasOwnProperty( field ) ) {

                fileArray.push( files[ field ] )

            }

        }

        return fileArray

    }

    _fileConversionSuccessCallback ( response, next, extraSuccessCallback, data ) {

        if ( extraSuccessCallback ) {
            extraSuccessCallback( data )
            return
        }

        this._inserter.save(
            data,
            this._convertersOptions,
            //            {
            //                parentId:        this._parentId,
            //                disableRootNode: this._disableRootNode
            //            },
            ( success ) => {

                this._checkEndOfReturns( response, [
                    {
                        title:   'Succées',
                        message: `Sauvegarder sous l'identifiant ${success}`
                    }
                ], next )

            },
            this._fileConversionProgressCallback.bind( this, response ),
            this._fileConversionErrorCallback.bind( this, response )
        )

    }

    _fileConversionProgressCallback ( response, progress ) {

        console.log( progress )

    }

    _fileConversionErrorCallback ( response, next, error ) {

        this._errors.push( error )
        this._checkEndOfReturns( response, next, null )

    }

    _checkEndOfReturns ( response, next, data ) {

        if ( this._errors.length > 0 ) {

            if ( this._useNext ) {
                next( this._errors )
            } else {
                I.return( response )( this._errors )
                this._errors = []
            }

        } else {
            if ( this._useNext ) {
                next()
            } else {
                I.returnData( data, response )
            }
        }

    }

    processFiles ( request, response, next ) {

        const files             = TAbstractConverterManager._convertFilesObjectToArray( request.files )
        const numberOfFiles     = files.length
        this._convertersOptions = request.body

        for ( let fileIndex = 0 ; fileIndex < numberOfFiles ; fileIndex++ ) {
            let file = files[ fileIndex ]
            if ( this._processedFiles.includes( file.filename ) ) { return }
            this._processedFiles.push( file.filename )
        }

        if ( numberOfFiles === 0 ) {

            if ( this._useNext ) {
                next( `Impossible d'analyser ${numberOfFiles} fichiers associatifs simultanément !` )
            } else {
                I.returnError( `Impossible d'analyser ${numberOfFiles} fichiers associatifs simultanément !`, response )
            }

        }

        this._processFiles( files, this._convertersOptions, response, next )

    }

    _processFiles ( files, parameters, response, next ) {

        const fileExtensions = files.map( ( file ) => path.extname( file.filename ) )
        const matchingRules  = this._rules.filter( elem => {

            const availables = elem.on

            if ( Array.isArray( availables ) ) {

                for ( var i = 0 ; i < availables.length ; i++ ) {
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

            if ( Array.isArray( converterNames ) ) {

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
                    files[0].file,
                    parameters,
                    this._fileConversionSuccessCallback.bind( this, response, next, null ),
                    this._fileConversionProgressCallback.bind( this, response ),
                    this._fileConversionErrorCallback.bind( this, response, next )
                )

            }

        }

    }

}

module.exports = TAbstractConverterManager
