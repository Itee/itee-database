/**
 * @module Messages/HTTP/AbstractHTTPError
 * @desc Export the AbstractHTTPError abstract class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires module:Messages/AbstractError~AbstractError
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */

import { isNotDefined }  from 'itee-validators'
import { AbstractError } from '../AbstractError'

/**
 * @class
 * @classdesc The AbstractHTTPError is the base class for all derived HTTPError.
 * It extend is AbstractError and agmente it with the status code notion.
 *
 * @extends module:Messages/AbstractError~AbstractError
 */
class AbstractHTTPError extends AbstractError {

    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    static get isAbstractHTTPError() { return true }

    /**
     * The abstract getter of http status code, internally it call the static getter statusCode that need to be reimplemented by extended class.
     * @readonly
     * @abstract
     * @type {number}
     * @throws {ReferenceError} In case the static statusCode getter is not redefined in class that inherit this class.
     */
    get statusCode() {
        if ( isNotDefined( this.constructor.statusCode ) ) {
            throw new ReferenceError( `${ this.name } class need to reimplement static statusCode getter.` )
        }
        return this.constructor.statusCode
    }

    set statusCode( value ) {
        throw new SyntaxError( 'Try to assign a read only property.' )
    }
}

export { AbstractHTTPError }
