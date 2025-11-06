import { series }                              from 'gulp'
import { checkBundlingFromEsmBuildImportTask } from './check-bundling-from-esm-build-import.task.mjs'
import { checkBundlingFromEsmFilesDirectTask } from './check-bundling-from-esm-files-direct.task.mjs'
import { checkBundlingFromEsmFilesImportTask } from './check-bundling-from-esm-files-import.task.mjs'

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

export { checkBundlingTask }
