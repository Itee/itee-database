/**
 * @module Messages/AbstractError
 * @desc Export the AbstractError abstract class.
 *
 * @requires {@link https://github.com/Itee/itee-validators itee-validators}
 * @requires {@link https://github.com/uuidjs/uuid uuid}
 *
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 */
import {
    isBlankString,
    isEmptyString,
    isNotDefined,
    isNotString
}                       from 'itee-validators'
import { v4 as uuidv4 } from 'uuid'

/**
 * @class
 * @classdesc The AbstractError is the base class for all derived errors.
 * It is composed by an uuid v4, the name which is based on the instance constructor name, and a message
 *
 * @extends Error
 */
class AbstractError extends Error {

    /**
     * @constructor
     * @param message {string} The error message to dispatch
     */
    constructor( message ) {
        super()

        this._uuid    = uuidv4()
        this._name    = this.constructor.name
        this._message = ( () => {
            // Validate message before assign it as readonly property !
            const expect = 'Expect a non empty string.'
            if ( isNotDefined( message ) ) { throw new ReferenceError( `The error message cannot be null or undefined. ${ expect }` )}
            if ( isNotString( message ) ) { throw new TypeError( `The error message cannot be an instance of ${ message.constructor.name }. ${ expect }` )}
            if ( isEmptyString( message ) ) { throw new TypeError( `The error message cannot be an empty string. ${ expect }` )}
            if ( isBlankString( message ) ) { throw new TypeError( `The error message cannot be a blank string. ${ expect }` )}

            return message
        } )()

        // Override the default Error stack behavior and apply get/set to avoid mutation
        this._stack = this.stack

        /**
         * The stack trace of the error
         * @member module:Messages/AbstractError~AbstractError#stack
         * @readonly
         * @type {string}
         */
        Object.defineProperty( this, 'stack', {
            get: () => { return this._stack },
            set: () => { throw new SyntaxError( 'Try to assign a read only property.' ) }
        } )


    }
    /**
     * A boolean based on classname that allow fast type checking, will ever be true
     * @constant
     * @default true
     * @type {boolean}
     */
    get isAbstractError() { return true }
    /**
     * An auto-generated universally unique identifier, this allow to recognize any error by id
     * @readonly
     * @type {string}
     */
    get uuid() { return this._uuid }
    set uuid( value ) { throw new SyntaxError( 'Try to assign a read only property.' ) }
    /**
     * The name of current instanced error (a.k.a the constructor name)
     * @readonly
     * @type {string}
     */
    get name() { return this._name }
    set name( value ) { throw new SyntaxError( 'Try to assign a read only property.' ) }
    /**
     * The error message
     * @readonly
     * @type {string}
     */
    get message() { return this._message }
    set message( value ) { throw new SyntaxError( 'Try to assign a read only property.' ) }

}

export { AbstractError }
