/**
 * @module Messages/HTTP/ForbiddenError
 * @desc Export the ForbiddenError http message class.
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
class ForbiddenError extends AbstractHTTPError {

    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isForbiddenError () { return true }

    /**
     * The static statusCode getter reimplementation for this kind of error, will return 403
     * @see module:Messages/HTTP/AbstractHTTPError~AbstractHTTPError#statusCode
     * @static
     * @constant
     * @default 422
     * @type {number}
     */
    static get statusCode () { return 403 }

}

export { ForbiddenError }
