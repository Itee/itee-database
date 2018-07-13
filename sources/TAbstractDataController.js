/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TDatabaseController
 * @classdesc The TDatabaseController is the base class to perform CRUD operations on the database
 */

import {
    isNullOrUndefined,
    isDefined,
    isArray,
    isNotEmptyArray,
    isNotEmptyObject
} from 'itee-validators'

import I from 'i-return'

class TAbstractDataController {

    constructor ( parameters ) {

        this._parameters = parameters

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

        const body = request.body
        const params = request.params
        const query = request.query

        if ( isDefined(body) && body[ dataName ] ) {

            return body[ dataName ]

        } else if ( isDefined(params) && params[ dataName ] ) {

            return params[ dataName ]

        } else if ( isDefined(query) && query[ dataName ] ) {

            return query[ dataName ]

        } else {

            I.returnError( {
                title:   'Erreur de paramètre',
                message: dataName + " n'existe pas dans les paramètres !"
            }, response )

        }
    }

    create ( request, response ) {

        const requestBody = request.body
        if ( isNullOrUndefined( requestBody ) ) {

            I.returnError( {
                title:   'Erreur de paramètre',
                message: 'Aucun paramètre n\'a été reçu !'
            }, response )
            return

        }

        if ( isArray( requestBody ) ) {

            this._createSome( requestBody, response )

        } else {

            this._createOne( requestBody, response )

        }

    }

    _createOne ( data, response ) {}

    _createSome ( datas, response ) {}

    read ( request, response ) {

        const requestBody = request.body
        const idParam     = request.params[ 'id' ]

        response.set( "Content-Type", "application/json" )

        if ( isDefined( requestBody ) ) {

            if ( isNotEmptyObject( requestBody ) ) {

                this._readByObject( requestBody, response )

            } else if ( isNotEmptyArray( requestBody ) ) {

                this._readByArray( requestBody, response )

            } else {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requête ne contient pas de données !'
                }, response )

            }

        } else if ( isDefined( idParam ) ) {

            this._readById( idParam, response )

        } else {

            this._readAll( response )

        }

    }

    _readById ( id, response ) {}

    _readByArray ( array, response ) {}

    _readByObject ( object, response ) {}

    _readAll ( response ) {}

    update ( request, response ) {

        const requestBody = request.body
        const idParam     = request.params[ 'id' ]

        if ( isDefined( requestBody ) ) {

            if ( isNotEmptyObject( requestBody ) ) {

                this._updateByObject( requestBody, response )

            } else if ( isNotEmptyArray( requestBody ) ) {

                this._updateByArray( requestBody, response )

            } else {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requête ne contient pas de données !'
                }, response )

            }

        } else if ( isDefined( idParam ) ) {

            this._updateById( idParam, response )

        } else {

            this._updateAll( response )

        }

    }

    _updateById ( id, response ) {}

    _updateByArray ( array, response ) {}

    _updateByObject ( object, response ) {}

    _updateAll ( response ) {}

    delete ( request, response ) {

        const requestBody = request.body
        const idParam     = request.params[ 'id' ]

        if ( isDefined( requestBody ) ) {

            if ( isNotEmptyObject( requestBody ) ) {

                this._deleteByObject( requestBody, response )

            } else if ( isNotEmptyArray( requestBody ) ) {

                this._deleteByArray( requestBody, response )

            } else {

                I.returnError( {
                    title:   'Erreur de paramètre',
                    message: 'La requête ne contient pas de données !'
                }, response )

            }

        } else if ( isDefined( idParam ) ) {

            this._deleteById( idParam, response )

        } else {

            this._deleteAll( response )

        }

    }

    _deleteById ( id, response ) {}

    _deleteByArray ( array, response ) {}

    _deleteByObject ( object, response ) {}

    _deleteAll ( response ) {}

}

export { TAbstractDataController }
