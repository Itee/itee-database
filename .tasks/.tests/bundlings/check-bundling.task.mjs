import colors                                  from 'ansi-colors'
import log                                     from 'fancy-log'
import { series }                              from 'gulp'
import { relative }                            from 'path'
import { packageRootDirectory }                from '../../_utils.mjs'
import { checkBundlingFromEsmBuildImportTask } from './check-bundling-from-esm-build-import.task.mjs'
import { checkBundlingFromEsmFilesDirectTask } from './check-bundling-from-esm-files-direct.task.mjs'
import { checkBundlingFromEsmFilesImportTask } from './check-bundling-from-esm-files-import.task.mjs'

const {
          green,
          blue
      } = colors

/**
 * @description In view to detect bundling side effects this task will
 * create intermediary file for each individual export from this package
 * and then create rollup config for each of them and bundle
 * Todo: Check for differents target env like next task below this one
 */
const checkBundlingTask       = series(
    checkBundlingFromEsmFilesImportTask,
    checkBundlingFromEsmBuildImportTask,
    checkBundlingFromEsmFilesDirectTask
)
checkBundlingTask.displayName = 'check-bundling'
checkBundlingTask.description = 'In view to detect bundling side effects this task will create intermediary file for each individual export and then try to bundle them.'

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( checkBundlingTask.displayName ) }` )

export { checkBundlingTask }
