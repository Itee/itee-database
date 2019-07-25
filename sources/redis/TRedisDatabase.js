/**
 * @author [Ahmed DCHAR]{@link https://github.com/dragoneel}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

import * as RedisDriver      from 'redis'
import { TAbstractDatabase } from '../core/databases/TAbstractDatabase'

class TRedisDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{},
            ...parameters,
            ...{
                driver: RedisDriver
            }
        }

        super( _parameters )

    }

    close ( onCloseCallback ) {}

    connect () {

        var client = this._driver.createClient()

        client.on( 'error', function ( err ) {
            console.log( 'Error ' + err )
        } )

        client.set( 'string key', 'string val', this._driver.print )
        client.hset( 'hash key', 'hashtest 1', 'some value', this._driver.print )
        client.hset( [ 'hash key', 'hashtest 2', 'some other value' ], this._driver.print )

        client.hkeys( 'hash key', function ( err, replies ) {
            console.log( replies.length + ' replies:' )

            replies.forEach( function ( reply, i ) {
                console.log( '    ' + i + ': ' + reply )
            } )

            client.quit()
        } )

    }

    init () {
        super.init()

    }

    on ( eventName, callback ) {}

}

export { TRedisDatabase }
