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
const SqlServerDriver   = require( 'tedious' )

const DEFAULT_CONNECT_TIMEOUT        = 15 * 1000
const DEFAULT_CLIENT_REQUEST_TIMEOUT = 15 * 1000
const DEFAULT_CANCEL_TIMEOUT         = 5 * 1000
const DEFAULT_CONNECT_RETRY_INTERVAL = 500
const DEFAULT_PACKET_SIZE            = 4 * 1024
const DEFAULT_TEXTSIZE               = 2147483647
const DEFAULT_DATEFIRST              = 7
const DEFAULT_PORT                   = 1433
const DEFAULT_TDS_VERSION            = '7_4'
const DEFAULT_LANGUAGE               = 'us_english'
const DEFAULT_DATEFORMAT             = 'mdy'

class TSQLServerDatabase extends TAbstractDatabase {

    constructor ( parameters = {} ) {

        const _parameters = {
            ...{
                server:         'localhost',
                authentication: {
                    type:    [ 'default', 'ntlm', 'azure-active-directory-password', 'azure-active-directory-access-token' ][ 0 ],
                    options: {
                        userName: 'dbo',
                        password: 'intelCOREi7'
                        //                        domain:   'IG'
                    }
                },
                options:        {
                    abortTransactionOnError:          false,
                    appName:                          undefined,
                    camelCaseColumns:                 false,
                    cancelTimeout:                    DEFAULT_CANCEL_TIMEOUT,
                    columnNameReplacer:               undefined,
                    connectionRetryInterval:          DEFAULT_CONNECT_RETRY_INTERVAL,
                    connectTimeout:                   DEFAULT_CONNECT_TIMEOUT,
                    //                    connectionIsolationLevel:         ISOLATION_LEVEL.READ_COMMITTED,
                    cryptoCredentialsDetails:         {},
                    database:                         undefined,
                    datefirst:                        DEFAULT_DATEFIRST,
                    dateFormat:                       DEFAULT_DATEFORMAT,
                    debug:                            {
                        data:    false,
                        packet:  false,
                        payload: false,
                        token:   false
                    },
                    enableAnsiNull:                   true,
                    enableAnsiNullDefault:            true,
                    enableAnsiPadding:                true,
                    enableAnsiWarnings:               true,
                    enableArithAbort:                 false,
                    enableConcatNullYieldsNull:       true,
                    enableCursorCloseOnCommit:        null,
                    enableImplicitTransactions:       false,
                    enableNumericRoundabort:          false,
                    enableQuotedIdentifier:           true,
                    encrypt:                          false,
                    fallbackToDefaultDb:              false,
                    instanceName:                     undefined,
                    //                    isolationLevel:                   ISOLATION_LEVEL.READ_COMMITTED,
                    language:                         DEFAULT_LANGUAGE,
                    localAddress:                     undefined,
                    maxRetriesOnTransientErrors:      3,
                    multiSubnetFailover:              false,
                    packetSize:                       DEFAULT_PACKET_SIZE,
                    port:                             DEFAULT_PORT,
                    readOnlyIntent:                   false,
                    requestTimeout:                   DEFAULT_CLIENT_REQUEST_TIMEOUT,
                    rowCollectionOnDone:              false,
                    rowCollectionOnRequestCompletion: false,
                    tdsVersion:                       DEFAULT_TDS_VERSION,
                    textsize:                         DEFAULT_TEXTSIZE,
                    trustServerCertificate:           true,
                    useColumnNames:                   false,
                    useUTC:                           true
                }
            },
            ...parameters
        }

        _parameters.driver = {
            SqlServerDriver: SqlServerDriver,
            Connection:      new SqlServerDriver.Connection( _parameters ),
            Request:         SqlServerDriver.Request
        }

        super( _parameters )

    }

    close ( onCloseCallback ) {

        this._driver.Connection.close()

    }

    connect () {

        this._driver.Connection.on( 'connect', connectionError => {

            if ( connectionError ) {
                console.error( connectionError )
                return
            }

            console.log( `SQLServer at XXX is connected !` )

            //            connection.close()

        } )

    }

    init () {
        super.init()

    }

    on ( eventName, callback ) {}

}

module.exports = TSQLServerDatabase
