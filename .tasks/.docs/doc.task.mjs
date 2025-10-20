import { getGulpConfigForTask } from '../../configs/gulp.conf.mjs'
import { normalize }            from 'path'
import { promisify }            from 'node:util'
import glob                     from 'glob'
import log                      from 'fancy-log'
import child_process            from 'node:child_process'
import colors                   from 'ansi-colors'

const execFile = promisify( child_process.execFile )
const red      = colors.red

async function docTask( done ) {

    const filesToDocPatterns = getGulpConfigForTask( 'doc' )

    const filesToDoc = []
    for ( const pattern of filesToDocPatterns ) {
        const files = glob.sync( pattern )
                          .map( filePath => normalize( filePath ) )

        filesToDoc.push( ...files )
    }

    try {
        const { stdout } = await execFile(
            './node_modules/.bin/jsdoc',
            [
                '--configure', './configs/jsdoc.conf.js',
                '--destination', './docs',
                ...filesToDoc
            ]
        )
        log( stdout )
    } catch ( error ) {
        log( red( error ) )
    }

    done()

}

export { docTask }