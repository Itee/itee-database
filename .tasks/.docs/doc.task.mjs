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
 * @method npm run doc
 * @global
 * @description Will generate this documentation
 */
const docTask       = async ( done ) => {

    try {
        const { stdout } = await execFile(
            './node_modules/.bin/jsdoc',
            [
                '--configure', './.tasks/configs/doc.conf.json',
                '--destination', './docs'
            ]
        )
        log( stdout )
        done()
    } catch ( error ) {
        done( red( error.message ) )
    }

}
docTask.displayName = 'doc'
docTask.description = 'Will generate this documentation.'
docTask.flags       = null

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( docTask.displayName ) }` )

export { docTask }