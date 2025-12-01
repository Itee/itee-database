import colors                   from 'ansi-colors'
import log                      from 'fancy-log'
import { relative }             from 'path'
import { packageRootDirectory } from '../_utils.mjs'

const {
          green,
          blue
      } = colors

/**
 * @method npm run patch
 * @global
 * @description Will apply some patch/replacements in dependencies
 */
const patchTask       = ( done ) => {
    done()
}
patchTask.displayName = 'patch'
patchTask.description = 'Will apply some patch/replacements in dependencies'
patchTask.flags       = null

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( patchTask.displayName ) }` )

export { patchTask }