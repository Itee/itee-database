/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TSQLServerController
 * @classdesc The TSQLServerController is the base class to perform CRUD operations on the database
 */

const { isNull, isUndefined, isString, isNotString, isNotArrayOfString } = require( 'itee-validators' )
const TAbstractDataController                                            = require( '../core/controllers/TAbstractDataController' )

class TSQLServerController extends TAbstractDataController {

    constructor ( DatabaseDriver, options ) {
        super( DatabaseDriver, options )

        this.tableName = options.tableName
        this.columns   = options.columns

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

    get columns () {
        return this._columns
    }

    set columns ( value ) {

        const valueName = 'Columns'
        const expect    = 'Expect an array of strings.'

        if ( isNull( value ) ) { throw new TypeError( `${valueName} cannot be null ! ${expect}` ) }
        if ( isUndefined( value ) ) { throw new TypeError( `${valueName} cannot be undefined ! ${expect}` ) }
        if ( isNotArrayOfString( value ) ) { throw new TypeError( `${valueName} cannot be an instance of ${value.constructor.name} ! ${expect}` ) }

        this._columns = value

    }

    setTableName ( value ) {

        this.tableName = value
        return this

    }

    setColumns ( value ) {

        this.columns = value
        return this

    }

    _createMany ( datas, response ) {
        super._createMany( datas, response )

        const columns         = this.columns
        const formatedColumns = columns.toString()

        let data           = null
        let formatedValues = ''
        let value          = null

        for ( let index = 0, numberOfDatas = datas.length ; index < numberOfDatas ; index++ ) {
            data = datas[ index ]

            formatedValues += `(`
            for ( let key in data ) {

                if ( !columns.includes( key ) ) { continue }

                value = data[ key ]

                if ( isString( value ) ) {
                    formatedValues += `'${value}', `
                } else {
                    formatedValues += `${value}, `
                }

            }
            formatedValues = formatedValues.slice( 0, -2 )
            formatedValues += `), `

        }
        formatedValues = formatedValues.slice( 0, -2 )

        const query   = `INSERT INTO ${this._tableName} (${formatedColumns}) VALUES ${formatedValues}`
        const request = new this._driver.Request( query, this.return( response ) )

        this._driver.Connection.execSql( request )

    }

    _createOne ( data, response ) {
        super._createOne( data, response )

        const columns = this.columns

        let formatedColumns = ''
        let column          = null
        let formatedValues  = ''
        let value           = null
        for ( let index = 0, numberOfColumns = columns.length ; index < numberOfColumns ; index++ ) {
            column = columns[ index ]
            value  = data[ column ]

            if ( value ) {
                formatedColumns += `${column}, `

                if ( isString( value ) ) {
                    formatedValues += `'${value}', `
                } else {
                    formatedValues += `${value}, `
                }
            }
        }
        formatedColumns = formatedColumns.slice( 0, -2 )
        formatedValues  = formatedValues.slice( 0, -2 )

        const query   = `INSERT INTO ${this._tableName} (${formatedColumns}) VALUES (${formatedValues})`
        const request = new this._driver.Request( query, this.return( response ) )

        this._driver.Connection.execSql( request )

    }

    _deleteAll ( response ) {
        super._deleteAll( response )

        const query   = `TRUNCATE TABLE ${this._tableName}`
        const request = new this._driver.Request( query, this.return( response ) )

        this._driver.Connection.execSql( request )

    }

    _deleteMany ( ids, response ) {
        super._deleteMany( ids, response )

        const query   = `DELETE FROM ${this._tableName} WHERE id IN (${ids})`
        const request = new this._driver.Request( query, this.return( response ) )

        this._driver.Connection.execSql( request )

    }

    _deleteOne ( id, response ) {
        super._deleteOne( id, response )

        const query   = `DELETE FROM ${this._tableName} WHERE id=${id}`
        const request = new this._driver.Request( query, this.return( response ) )

        this._driver.Connection.execSql( request )

    }

    _deleteWhere ( query, response ) {
        super._deleteWhere( query, response )

        TAbstractDataController.returnError( 'Unimplemented methods (DELETE WHERE)', response )

    }

    _readAll ( projection, response ) {
        super._readAll( projection, response )

        let results = []

        const query   = `SELECT * FROM ${this.tableName}`
        const request = new this._driver.Request( query, ( requestError, rowCount, result ) => {

            if ( requestError ) {

                TAbstractDataController.returnError( requestError, response )

            } else if ( results.length === 0 ) {

                TAbstractDataController.returnNotFound( response )

            } else {

                TAbstractDataController.returnData( results, response )

            }

        } )

        request.on( 'row', columns => {

            let result = {}
            columns.forEach( column => {

                result[ column.metadata.colName ] = column.value

            } )
            results.push( result )

        } )

        this._driver.Connection.execSql( request )

    }

    _readMany ( ids, projection, response ) {
        super._readMany( ids, projection, response )

        let results = []

        const idsFormated = ids.toString()
        const query       = `SELECT * FROM ${this.tableName} WHERE id IN (${idsFormated})`
        const request     = new this._driver.Request( query, ( requestError, rowCount, result ) => {

            if ( requestError ) {

                TAbstractDataController.returnError( requestError, response )

            } else if ( results.length === 0 ) {

                TAbstractDataController.returnNotFound( response )

            } else {

                TAbstractDataController.returnData( results, response )

            }

        } )

        request.on( 'row', columns => {

            let result = {}
            columns.forEach( column => {

                result[ column.metadata.colName ] = column.value

            } )
            results.push( result )

        } )

        this._driver.Connection.execSql( request )

    }

    _readOne ( id, projection, response ) {
        super._readOne( id, projection, response )

        let results = []

        const query   = `SELECT * FROM ${this.tableName} WHERE id=${id}`
        const request = new this._driver.Request( query, ( requestError, rowCount, result ) => {

            if ( requestError ) {

                TAbstractDataController.returnError( requestError, response )

            } else if ( results.length === 0 ) {

                TAbstractDataController.returnNotFound( response )

            } else {

                TAbstractDataController.returnData( results, response )

            }

        } )

        request.on( 'row', columns => {

            let result = {}
            columns.forEach( column => {

                result[ column.metadata.colName ] = column.value

            } )
            results.push( result )

        } )

        this._driver.Connection.execSql( request )

    }

    _readWhere ( query, projection, response ) {
        super._readWhere( query, projection, response )

        TAbstractDataController.returnError( 'Unimplemented methods (READ WHERE)', response )

    }

    _updateAll ( update, response ) {
        super._updateAll( update, response )

        let formatedUpdates = ''
        for ( let key in update ) {
            const formatedUpdate = update[ key ]
            if ( isString( formatedUpdate ) ) {
                formatedUpdates += `${key} = '${formatedUpdate}', `
            } else {
                formatedUpdates += `${key} = ${formatedUpdate}, `
            }
        }
        formatedUpdates = formatedUpdates.slice( 0, -2 )

        const query   = `UPDATE ${this._tableName} SET ${formatedUpdates}`
        const request = new this._driver.Request( query, this.return( response ) )

        this._driver.Connection.execSql( request )

    }

    _updateMany ( ids, updates, response ) {
        super._updateMany( ids, updates, response )

        let formatedUpdates = ''
        let formatedUpdate  = null
        for ( let key in updates ) {
            formatedUpdate = updates[ key ]
            if ( isString( formatedUpdate ) ) {
                formatedUpdates += `${key} = '${formatedUpdate}', `
            } else {
                formatedUpdates += `${key} = ${formatedUpdate}, `
            }
        }
        formatedUpdates = formatedUpdates.slice( 0, -2 )

        const query   = `UPDATE ${this._tableName} SET ${formatedUpdates} WHERE id IN (${ids})`
        const request = new this._driver.Request( query, this.return( response ) )

        this._driver.Connection.execSql( request )

    }

    _updateOne ( id, update, response ) {
        super._updateOne( id, update, response )

        let formatedUpdates = ''
        let formatedUpdate  = null
        for ( let key in update ) {
            formatedUpdate = update[ key ]
            if ( isString( formatedUpdate ) ) {
                formatedUpdates += `${key} = '${formatedUpdate}', `
            } else {
                formatedUpdates += `${key} = ${formatedUpdate}, `
            }
        }
        formatedUpdates = formatedUpdates.slice( 0, -2 )

        const query   = `UPDATE ${this._tableName} SET ${formatedUpdates} WHERE id=${id}`
        const request = new this._driver.Request( query, this.return( response ) )

        this._driver.Connection.execSql( request )

    }

    _updateWhere ( query, update, response ) {
        super._updateWhere( query, update, response )

        TAbstractDataController.returnError( 'Unimplemented methods (UPDATE WHERE)', response )

    }

}

module.exports = TSQLServerController
