/**
 * @module Messages/HTTP/HTTPRequestSentToHTTPSPortError
 * @desc Export the HTTPRequestSentToHTTPSPortError http message class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { AbstractHTTPError } from './AbstractHTTPError'

/**
 * @class
 * @classdesc The UnprocessableEntityError is the error class for this kind of error.
 * It extend is AbstractHTTPError and fix his status code.
 *
 * @extends module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError
 */
class HTTPRequestSentToHTTPSPortError extends AbstractHTTPError {

    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isHTTPRequestSentToHTTPSPortError () { return true }

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 497
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 497 }

}

export { HTTPRequestSentToHTTPSPortError }
