import colors                   from 'ansi-colors'
import { deleteAsync }          from 'del'
import log                      from 'fancy-log'
import { relative }             from 'path'
import { packageRootDirectory } from '../_utils.mjs'
import { cleanConf }            from '../configs/clean.conf.mjs'

const {
          red,
          green,
          blue
      } = colors

/**
 * @method npm run clean
 * @global
 * @description Will delete builds and temporary folders
 */
const cleanTask       = () => deleteAsync( cleanConf, {
    onProgress: progress => {
        const path    = progress.path || 'Nothing to clean...'
        const percent = Math.round( progress.percent * 100 )
        const spacer  = percent === 100 ? '' : ' '
        log( `Deleting [${ progress.deletedCount }/${ progress.totalCount }]<${ percent }%>${ spacer }:`, red( path ) )
    }
} )
cleanTask.displayName = 'clean'
cleanTask.description = 'Will delete builds and temporary folders'
cleanTask.flags       = null

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( cleanTask.displayName ) }` )

export { cleanTask }
