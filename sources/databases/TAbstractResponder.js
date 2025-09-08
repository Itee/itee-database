/**
 * @module Databases/TAbstractResponder
 * @desc Export the TAbstractResponder abstract class.
 * @exports TAbstractResponder
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { TAbstractObject } from 'itee-core'
import {
    isArray,
    isDefined,
    isFunction,
    isObject,
    isString
}                          from 'itee-validators'
import { UnknownError }    from '../messages/http/UnknownError'

/**
 * @class
 * @classdesc The TAbstractResponder is the base class for all derived database controller that require to send a response to client.
 * It allow to send preformatted response in function of database query result.
 */
class TAbstractResponder extends TAbstractObject {

    /**
     * Normalize errors that can be in different format like single string, object, array of string, or array of object.
     *
     * @example <caption>Normalized error are simple literal object like:</caption>
     * {
     *     name: 'TypeError',
     *     message: 'the error message'
     * }
     *
     * @param {String|Object|Array.<String>|Array.<Object>} errors - The error object to normalize
     * @returns {Array.<Object>}
     * @private
     */
    static _formatErrors ( errors = [] ) {

        const _errors = ( isArray( errors ) ) ? errors : [ errors ]

        let formattedErrors = []

        for ( let i = 0, numberOfErrors = _errors.length ; i < numberOfErrors ; i++ ) {
            formattedErrors.push( TAbstractResponder._formatError( _errors[ i ] ) )
        }

        return formattedErrors

    }
    /**
     * Normalize error that can be in different format like single string, object, array of string, or array of object.
     *
     * @example <caption>Normalized error are simple literal object like:</caption>
     * {
     *     name: 'TypeError',
     *     message: 'the error message'
     * }
     *
     * @param {String|Object|Error} error - The error object to normalize
     * @returns {AbstractHTTPError}
     * @private
     */
    static _formatError ( error ) {

        let formattedError

        if ( error instanceof Error ) {

            formattedError = error
            formattedError.statusCode = 500

        } else if ( isString( error ) ) {

            formattedError = new UnknownError( error )

        } else if ( isObject( error ) ) {

            const name    = error.name
            const message = error.message || 'Empty message...'

            formattedError = new UnknownError( message )
            if ( name ) {
                formattedError.name = name
            }

        } else {

            formattedError = new UnknownError( error.toString() )

        }

        return formattedError

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

        const formatedError = TAbstractResponder._formatError( error )

        response.format( {

            'application/json': () => {
                response.status( formatedError.statusCode ).json( formatedError )
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
            errors: TAbstractResponder._formatErrors( error ),
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
                returnErrorAndData: TAbstractResponder.returnErrorAndData.bind( this ),
                returnError:        TAbstractResponder.returnError.bind( this ),
                returnData:         TAbstractResponder.returnData.bind( this ),
                returnNotFound:     TAbstractResponder.returnNotFound.bind( this )
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
            ...{},
            ...parameters
        }

        super( _parameters )
    }

}

export { TAbstractResponder }
