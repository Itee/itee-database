import { join }           from 'path'
import rollupConfigurator from '../../configs/rollup.conf.js'
import parseArgs          from 'minimist'
import { getDirname }     from '../_utils.mjs'
import { packageInfos }   from '../_utils.mjs'
import { rollup }         from 'rollup'
import log                from 'fancy-log'

function build( done ) {

    const __dirname = getDirname()

    const options = parseArgs( process.argv, {
        string:  [ 'n', 'i', 'f', 'e' ],
        boolean: [ 's', 't' ],
        default: {
            i: join( __dirname, 'sources', `${ packageInfos.name }.js` ),
            o: join( __dirname, 'builds' ),
            f: [ 'esm', 'cjs', 'iife' ],
            e: [ 'dev', 'prod' ],
            s: true,
            t: true
        },
        alias:   {
            i: 'input',
            o: 'output',
            f: 'formats',
            e: 'envs',
            s: 'sourcemap',
            t: 'treeshake'
        }
    } )

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