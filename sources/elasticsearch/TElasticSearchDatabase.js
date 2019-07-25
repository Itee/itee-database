/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

const TAbstractDatabase   = require( '../core/databases/TAbstractDatabase' )
const ElasticSearchDriver = require( 'elasticsearch' )

class TElasticSearchDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: ElasticSearchDriver
            }
        }

        super( _parameters )

    }

    close ( onCloseCallback ) {}

    connect () {

        var client = this._driver.Client( {
            host: 'localhost:9200'
        } )

        client.search( {
            index: 'books',
            type:  'book',
            body:  {
                query: {
                    multi_match: {
                        query:  'express js',
                        fields: [ 'title', 'description' ]
                    }
                }
            }
        } ).then( function ( response ) {
            var hits = response.hits.hits
        }, function ( error ) {
            console.trace( error.message )
        } )

    }

    init () {
        super.init()

    }

    on ( eventName, callback ) {}
}

module.exports = TElasticSearchDatabase
