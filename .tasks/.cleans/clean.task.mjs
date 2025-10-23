import colors                        from 'ansi-colors'
import { deleteAsync }               from 'del'
import log                           from 'fancy-log'
import { cleanConf as filesToClean } from '../configs/clean.conf.mjs'

const red = colors.red

async function cleanTask( done ) {

    try {
        await deleteAsync( filesToClean, {
            onProgress: progress => {
                const path = progress.path || 'Nothing to clean...'
                log( `Delete [${ progress.deletedCount }/${ progress.totalCount }] (${ Math.round( progress.percent * 100 ) }%):`, red( path ) )
            }
        } )
        done()
    } catch ( error ) {
        done( red( error.message ) )
    }


}

export { cleanTask }