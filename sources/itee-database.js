/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

// Controllers
const TAbstractDataController = require( './controllers/TAbstractDataController' )
const TMongooseController     = require( './controllers/TMongooseController' )

// Converters
const { MemoryWriteStream, TAbstractFileConverter } = require( './converters/TAbstractFileConverter' )
const TAbstractDataConverter                        = require( './converters/TAbstractDataConverter' )
const TAbstractDataInserter                         = require( './converters/TAbstractDataInserter' )

// Databases
const TAbstractDatabase = require( './databases/TAbstractDatabase' )
const TMongoDBDatabase  = require( './databases/TMongoDBDatabase' )
const TPostgresDatabase = require( './databases/TPostgresDatabase' )

// Plugins interfaces
const TAbstractDatabasePlugin = require( './plugins/TAbstractDatabasePlugin' )
const TMongoDBPlugin          = require( './plugins/TMongoDBPlugin' )

module.exports = {
    TAbstractDataController,
    TMongooseController,

    MemoryWriteStream,
    TAbstractFileConverter,
    TAbstractDataConverter,
    TAbstractDataInserter,

    TAbstractDatabase,
    TMongoDBDatabase,
    TPostgresDatabase,

    TAbstractDatabasePlugin,
    TMongoDBPlugin
}
