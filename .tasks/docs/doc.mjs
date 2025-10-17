import log                      from 'fancy-log'
import jsdocConfiguration       from '../../configs/jsdoc.conf.js'
import { getGulpConfigForTask } from '../../configs/gulp.conf.mjs'
import gulp                     from 'gulp'
import jsdoc                    from 'gulp-jsdoc3'


async function doc( done ) {

    const config     = jsdocConfiguration
    const filesToDoc = getGulpConfigForTask( 'doc' )

    for ( let fileIndex = 0, numberOfFiles = filesToDoc.length ; fileIndex < numberOfFiles ; fileIndex++ ) {
        log( `[${ fileIndex + 1 }/${ numberOfFiles }] Documenting ${ filesToDoc[ fileIndex ] }` )
    }

    // gulp
    //     .src( filesToDoc, {
    //         read:       false,
    //         allowEmpty: true
    //     } )
    //     .pipe( jsdoc( config, done ) )
    //     .on( 'error', done )

    await new Promise( ( ( resolve, reject ) => {
        gulp.src( filesToDoc, {
            read:       false,
            allowEmpty: true
        } )
            .pipe( jsdoc( config, resolve ) )
            .on( 'error', reject )
    } ) )
    done()

}

export { doc }