import { getGulpConfigForTask } from '../../configs/gulp.conf.mjs'
import { deleteAsync }          from 'del'
import log                      from 'fancy-log'
import colors                   from 'ansi-colors'

const red = colors.red

function cleanTask( done ) {

    const filesToClean = getGulpConfigForTask( 'clean' )

    for ( let fileIndex = 0, numberOfFiles = filesToClean.length ; fileIndex < numberOfFiles ; fileIndex++ ) {
        log( red( `[${ fileIndex + 1 }/${ numberOfFiles }] Delete ${ filesToClean[ fileIndex ] }` ) )
    }

    return deleteAsync( filesToClean )

}

export { cleanTask }