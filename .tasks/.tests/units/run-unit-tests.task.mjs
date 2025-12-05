import colors                                 from 'ansi-colors'
import log                                    from 'fancy-log'
import { relative }                           from 'path'
import {
    packageRootDirectory,
    serializeTasksFrom
}                                             from '../../_utils.mjs'
import { runUnitTestsTaskFiles as taskFiles } from '../../configs/run-unit-tests.conf.mjs'

const {
          green,
          blue
      } = colors

const runUnitTestsTask       = await serializeTasksFrom( taskFiles )
runUnitTestsTask.displayName = 'run-unit-tests'
runUnitTestsTask.description = 'Will run unit tests in back and front environments.'
runUnitTestsTask.flags       = null

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( runUnitTestsTask.displayName ) }` )

export { runUnitTestsTask }