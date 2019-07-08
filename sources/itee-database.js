/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

    // Core
const {
          MemoryWriteStream,
          TAbstractConverterManager,
          TAbstractDatabase,
          TAbstractDatabasePlugin,
          TAbstractDataController,
          TAbstractDataConverter,
          TAbstractDataInserter,
          TAbstractFileConverter
      } = require( './core/_core' )

// cassandra
const {} = require( './cassandra/_cassandra' )

// couchbase
const {} = require( './couchbase/_couchbase' )

// couchdb
const {} = require( './couchdb/_couchdb' )

// elasticsearch
const {} = require( './elasticsearch/_elasticsearch' )

// leveldb
const {} = require( './leveldb/_leveldb' )

// mongodb
const { TMongoDBDatabase, TMongoDBPlugin, TMongooseController } = require( './mongodb/_mongodb' )

// mysql
const {} = require( './mysql/_mysql' )

// neo4j
const {} = require( './neo4j/_neo4j' )

// oracle
const {} = require( './oracle/_oracle' )

// postgresql
const { TPostgresController, TPostgresDatabase } = require( './postgresql/_postgresql' )

// redis
const {} = require( './redis/_redis' )

// sqlite
const {} = require( './sqlite/_sqlite' )

// sqlserver
const { TSQLServerDatabase, TSQLServerController } = require( './sqlserver/_sqlserver' )

module.exports = {
    MemoryWriteStream,
    TAbstractConverterManager,
    TAbstractDatabase,
    TAbstractDatabasePlugin,
    TAbstractDataController,
    TAbstractDataConverter,
    TAbstractDataInserter,
    TAbstractFileConverter,
    TMongoDBDatabase,
    TMongoDBPlugin,
    TMongooseController,
    TPostgresDatabase,
    TSQLServerController,
    TSQLServerDatabase
}
