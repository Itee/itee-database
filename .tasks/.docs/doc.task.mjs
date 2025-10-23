import colors        from 'ansi-colors'
import log           from 'fancy-log'
import child_process from 'node:child_process'
import { promisify } from 'node:util'

const execFile = promisify( child_process.execFile )
const red      = colors.red

async function docTask( done ) {

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

export { docTask }