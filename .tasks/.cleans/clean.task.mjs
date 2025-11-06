import colors          from 'ansi-colors'
import { deleteAsync } from 'del'
import log             from 'fancy-log'
import { cleanConf }   from '../configs/clean.conf.mjs'

const red = colors.red

/**
 * @method npm run clean
 * @global
 * @description Will delete builds and temporary folders
 */
const cleanTask       = () => deleteAsync( cleanConf, {
    onProgress: progress => {
        const path = progress.path || 'Nothing to clean...'
        log( `Delete [${ progress.deletedCount }/${ progress.totalCount }] (${ Math.round( progress.percent * 100 ) }%):`, red( path ) )
    }
} )
cleanTask.displayName = 'clean'
cleanTask.description = 'Will delete builds and temporary folders'
cleanTask.flags       = null

export { cleanTask }
