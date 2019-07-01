/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TSQLServerController
 * @classdesc The TSQLServerController is the base class to perform CRUD operations on the database
 */

const { isNull, isUndefined, isNotString } = require( 'itee-validators' )
const TAbstractDataController              = require( '../core/controllers/TAbstractDataController' )

class TSQLServerController extends TAbstractDataController {

    constructor ( DatabaseDriver, options ) {
        super( DatabaseDriver, options )

        this.tableName = options.tableName

    }

    get tableName () {
        return this._tableName
    }

    set tableName ( value ) {

        const valueName = 'Table name'
        const expect    = 'Expect an instance of String.'

        if ( isNull( value ) ) { throw new TypeError( `${valueName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${valueName} cannot be undefined ! ${expect}` ) }
        if ( isNotString( value ) ) { throw new TypeError( `${valueName} cannot be an instance of ${value.constructor.name} ! ${expect}` ) }

        this._tableName = value

    }

    _createMany ( datas, response ) {
        super._createMany( datas, response )

    }

    // Create
    _createOne ( data, response ) {
        super._createOne( data, response )

        const SqlServer = this._driver

        const connection = new SqlServer.Connection( config )

        connection.on( 'connect', connectionError => {

            if ( connectionError ) {

                TAbstractDataController.returnError( connectionError, response )

            } else {

                const request = new SqlServer.Request( 'select 123, \'hello world\'', ( requestError, rowCount ) => {

                    if ( requestError ) {

                        TAbstractDataController.returnError( requestError, response )

                    } else {

                        console.log( `${rowCount} rows` )

                    }

                    connection.close()

                } )

                request.on( 'row', columns => {

                    columns.forEach( column => {

                        if ( column.value === null ) {
                            console.log( 'NULL' )
                        } else {
                            console.log( column.value )
                        }

                    } )

                } )

                connection.execSql( request )

            }

        } )

    }

    _deleteAll ( response ) {
        super._deleteAll( response )

    }

    _deleteMany ( ids, response ) {
        super._deleteMany( ids, response )

    }

    // Delete
    _deleteOne ( id, response ) {
        super._deleteOne( id, response )

    }

    _deleteWhere ( query, response ) {
        super._deleteWhere( query, response )

    }

    _readAll ( projection, response ) {
        super._readAll( projection, response )

        const SqlServer = this._driver

        const connection = new SqlServer.Connection( config )

        connection.on( 'connect', connectionError => {

            if ( connectionError ) {

                TAbstractDataController.returnError( connectionError, response )

            } else {

                const request = new SqlServer.Request( `SELECT * FROM ${this.tableName}`, ( requestError, rowCount ) => {

                    if ( requestError ) {

                        TAbstractDataController.returnError( requestError, response )

                    } else {

                        console.log( `${rowCount} rows` )

                    }

                    connection.close()

                } )

                request.on( 'row', columns => {

                    columns.forEach( column => {

                        if ( column.value === null ) {
                            console.log( 'NULL' )
                        } else {
                            console.log( column.value )
                        }

                    } )

                } )

                connection.execSql( request )

            }

        } )

    }

    _readMany ( ids, projection, response ) {
        super._readMany( ids, projection, response )

    }

    // Read
    _readOne ( id, projection, response ) {
        super._readOne( id, projection, response )

    }

    _readWhere ( query, projection, response ) {
        super._readWhere( query, projection, response )

    }

    _updateAll ( update, response ) {
        super._updateAll( update, response )

    }

    _updateMany ( ids, updates, response ) {
        super._updateMany( ids, updates, response )

    }

    // Update
    _updateOne ( id, update, response ) {
        super._updateOne( id, update, response )

    }

    _updateWhere ( query, update, response ) {
        super._updateWhere( query, update, response )

    }

}

module.exports = TSQLServerController
