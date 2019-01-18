/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TMongooseController
 * @classdesc The TMongooseController is the base class to perform CRUD operations on the database
 */

const { isNull, isUndefined, isEmptyArray } = require( 'itee-validators' )
const TAbstractDataController = require( './TAbstractDataController' )

class TMongooseController extends TAbstractDataController {

    constructor ( Mongoose, options ) {
        super( Mongoose, options )

        this.databaseSchema = Mongoose.model( options.schemaName )

    }

    get databaseSchema () {

        return this._databaseSchema

    }

    set databaseSchema ( value ) {

        if ( isNull( value ) ) { throw new TypeError( 'Database schema cannot be null.' ) }
        if ( isUndefined( value ) ) { throw new TypeError( 'Database schema cannot be undefined.' ) }

        this._databaseSchema = value

    }

    setDatabaseSchema ( value ) {

        this.databaseSchema = value
        return this

    }

    // Create
    _createOne ( data, response ) {
        super._createOne( data, response )

        this._databaseSchema.create( data, this.return( response ) )

    }

    _createMany ( datas, response ) {
        super._createMany( datas, response )

        this._databaseSchema.create( datas, this.return( response ) )

    }

    // Read
    _readOne ( id, projection, response ) {
        super._readOne( id, projection, response )

        this._databaseSchema
            .findById( id, projection )
            .lean()
            .exec()
            .then( (data) => {

                if( isNull(data) ) {
                    TAbstractDataController.returnNotFound( response )
                } else {
                    TAbstractDataController.returnData( data, response )
                }

            } )
            .catch( error => TAbstractDataController.returnError( error, response ) )

    }

    _readMany ( ids, projection, response ) {
        super._readMany( ids, projection, response )

        this._databaseSchema
            .find( { '_id': { $in: ids } }, projection )
            .lean()
            .exec()
            .then( (data) => {

                if( isNull(data) || isEmptyArray(data) ) {
                    TAbstractDataController.returnNotFound( response )
                } else if( ids.length !== data.length ) {
                    TAbstractDataController.returnErrorAndData( {title: 'Missing data', message: 'Some requested objects could not be found.'}, data, response )
                } else {
                    TAbstractDataController.returnData( data, response )
                }

            } )
            .catch( error => TAbstractDataController.returnError( error, response ) )

    }

    _readWhere ( query, projection, response ) {
        super._readWhere( query, projection, response )

        this._databaseSchema
            .find( query, projection )
            .lean()
            .exec()
            .then( data => TAbstractDataController.returnData( data, response ) )
            .catch( error => TAbstractDataController.returnError( error, response ) )

    }

    _readAll ( projection, response ) {
        super._readAll( projection, response )

        this._databaseSchema
            .find( {}, projection )
            .lean()
            .exec()
            .then( data => TAbstractDataController.returnData( data, response ) )
            .catch( error => TAbstractDataController.returnError( error, response ) )

    }

    // Update
    _updateOne ( id, update, response ) {
        super._updateOne( id, update, response )

        this._databaseSchema
            .findByIdAndUpdate( id, update )
            .exec()
            .then( data => TAbstractDataController.returnData( data, response ) )
            .catch( error => TAbstractDataController.returnError( error, response ) )

    }

    _updateMany ( ids, update, response ) {
        super._updateMany( ids, update, response )

        this._databaseSchema.update( { _id: { $in: ids } }, update, { multi: true }, this.return( response ) )

    }

    _updateWhere ( query, update, response ) {
        super._updateWhere( query, update, response )

        this._databaseSchema.update( query, update, { multi: true }, this.return( response ) )

    }

    _updateAll ( update, response ) {
        super._updateAll( update, response )

        this._databaseSchema.update( {}, update, { multi: true }, this.return( response ) )

    }

    // Delete
    _deleteOne ( id, response ) {
        super._deleteOne( id, response )

        this._databaseSchema
            .findByIdAndDelete( id )
            .then( data => TAbstractDataController.returnData( data, response ) )
            .catch( error => TAbstractDataController.returnError( error, response ) )

    }

    _deleteMany ( ids, response ) {
        super._deleteMany( ids, response )

        this._databaseSchema.deleteMany( { '_id': { $in: ids } }, this.return( response ) )

    }

    _deleteWhere ( query, response ) {
        super._deleteWhere( query, response )

        this._databaseSchema.deleteMany( query, this.return( response ) )

    }

    _deleteAll ( response ) {
        super._deleteAll( response )

        this._databaseSchema.collection.drop( this.return( response ) )

    }

}

module.exports = TMongooseController
