import colors                   from 'ansi-colors'
import log                      from 'fancy-log'
import child_process            from 'node:child_process'
import { promisify }            from 'node:util'
import { relative }             from 'path'
import { packageRootDirectory } from '../_utils.mjs'

const execFile = promisify( child_process.execFile )
const {
          red,
          green,
          blue
      }        = colors

/**
 * @method npm run lint
 * @global
 * @description Will lint the sources files and try to fix the style when possible
 */
const lintTask       = async ( done ) => {

    try {

        const { stdout } = await execFile( 'npx', [ 'eslint', '--config', './.tasks/configs/eslint.conf.mjs', '--fix' ] )
        if ( stdout !== '' ) {
            log( stdout )
        }

        done()

    } catch ( error ) {

        log( error.stdout )
        done( red( error.message ) )

    }

}
lintTask.displayName = 'lint'
lintTask.description = 'Will lint the sources files and try to fix the style when possible.'
lintTask.flags       = null

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( lintTask.displayName ) }` )

export { lintTask }