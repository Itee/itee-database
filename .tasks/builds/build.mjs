import rollupConfigurator from '../../configs/rollup.conf.js'
import { rollup }         from 'rollup'
import log                from 'fancy-log'
import { getGulpConfigForTask } from '../../configs/gulp.conf.mjs'

function build( done ) {

    const options = getGulpConfigForTask('builds')
    const configs = rollupConfigurator( options )

    nextBuild()

    function nextBuild( error ) {
        'use strict'

        if ( error ) {

            done( error )

        } else if ( configs.length === 0 ) {

            done()

        } else {

            const config = configs.pop()
            log( `Building ${ config.output.file }` )

            rollup( config )
                .then( ( bundle ) => { return bundle.write( config.output ) } )
                .then( () => { nextBuild() } )
                .catch( nextBuild )

        }

    }

}

export { build }