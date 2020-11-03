/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file
 * @desc The itee-database package contain all abstract class to manage database middleware and database plugins for itee server.
 */

/**
 * The itee-validators package.
 *
 * @external "Itee.Validators"
 * @see {@link https://github.com/Itee/itee-validators/|Itee.Validators}
 */

/**
 * Any others externals stuff
 * @external Others
 */
/**
 * An official database driver to process query and request to the targeted database.
 * @typedef {DatabaseDriver} external:Others~DatabaseDriver
 */

// Controllers
export * from './controllers/TAbstractDataController'

// Converters
export * from './converters/TAbstractDataConverter'
export * from './converters/TAbstractConverterManager'
export * from './converters/TAbstractDataInserter'
export * from './converters/TAbstractFileConverter'

// Databases
export * from './databases/TAbstractDatabase'
export * from './databases/TAbstractResponder'

// Messages
export * from './messages/_messages'

// Plugins interfaces
export * from './plugins/TAbstractDatabasePlugin'

export const Databases = new Map()
