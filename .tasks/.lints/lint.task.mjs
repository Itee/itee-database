import colors        from 'ansi-colors'
import log           from 'fancy-log'
import child_process from 'node:child_process'
import { promisify } from 'node:util'

const execFile = promisify( child_process.execFile )
const red      = colors.red

async function lintTask( done ) {

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

export { lintTask }