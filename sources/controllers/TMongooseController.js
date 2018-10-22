/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @class TMongooseController
 * @classdesc The TMongooseController is the base class to perform CRUD operations on the database
 */

const { isNull, isUndefined } = require( 'itee-validators' )
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
            .then( data => TAbstractDataController.returnData( data, response ) )
            .catch( error => TAbstractDataController.returnError( error, response ) )

    }

    _readMany ( ids, projection, response ) {
        super._readMany( ids, projection, response )

        this._databaseSchema
            .find( { '_id': { $in: ids } }, projection )
            .lean()
            .exec()
            .then( data => TAbstractDataController.returnData( data, response ) )
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

        const numberOfDatas = ids.length
        let numberOfUpdate  = 0
        let errors          = []
        let results         = []

        for ( let dataIndex = 0 ; dataIndex < numberOfDatas ; dataIndex++ ) {

            this._databaseSchema.update( { _id: ids[ dataIndex ] }, update, onEnd )

        }

        function onEnd ( error, result ) {

            if ( error ) {
                errors.push( error )
            }

            if ( result ) {
                results.push( result )
            }

            numberOfUpdate++

            if ( numberOfUpdate < numberOfUpdate - 1 ) {
                return
            }

            const haveErrors = (errors.length > 0)
            const haveDatas  = (results.length > 0)
            if ( haveErrors && haveDatas ) {

                TAbstractDataController.returnErrorAndData( errors, results, response )

            } else if ( haveErrors && !haveDatas ) {

                TAbstractDataController.returnError( errors, response )

            } else if ( !haveErrors && haveDatas ) {

                TAbstractDataController.returnData( results, response )

            } else {

                TAbstractDataController.returnNotFound( response )

            }

        }

    }

    _updateWhere ( query, update, response ) {
        super._updateWhere( query, update, response )

        this._databaseSchema.update( query, update, this.return( response ) )

    }

    _updateAll ( update, response ) {
        super._updateAll( update, response )

        // Not allowed !

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
