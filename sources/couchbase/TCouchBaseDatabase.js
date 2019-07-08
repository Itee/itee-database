/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const TAbstractDatabase = require( '../core/databases/TAbstractDatabase' )
const CoucheBaseDriver  = require( 'couchbase' )

class TCouchBaseDatabase extends TAbstractDatabase {

    constructor ( app, router, plugins, parameters ) {
        super( CoucheBaseDriver, app, router, plugins, parameters )

        const _parameters = { ...{}, ...parameters }

    }

    close ( onCloseCallback ) {}

    connect () {

        var bucket = ( new this._driver.Cluster( 'http://localhost:8091' ) ).openBucket( 'bucketName' )

        // add a document to a bucket
        bucket.insert(
            'document-key',
            {
                name:     'Matt',
                shoeSize: 13
            },
            function ( err, result ) {
                if ( err ) {
                    console.log( err )
                } else {
                    console.log( result )
                }
            } )

        // get all documents with shoe size 13
        var n1ql  = 'SELECT d.* FROM `bucketName` d WHERE shoeSize = $1'
        var query = N1qlQuery.fromString( n1ql )
        bucket.query( query, [ 13 ], function ( err, result ) {
            if ( err ) {
                console.log( err )
            } else {
                console.log( result )
            }
        } )

    }

    on ( eventName, callback ) {}

    _initDatabase () {
        super._initDatabase()

    }

}

module.exports = TCouchBaseDatabase
