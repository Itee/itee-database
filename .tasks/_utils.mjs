import {
    join,
    dirname
}                        from 'path'
import { readFileSync }  from 'fs'
import { fileURLToPath } from 'url'

// We cannot use directly the import.meta.dirname or filename because all IDE usage do not produce them
// We use
function getDirname() {

    let __dirname

    if ( import.meta.dirname ) {
        __dirname = import.meta.dirname
    } else if ( import.meta.filename ) {
        __dirname = dirname( import.meta.filename )
    } else if ( import.meta.url ) {
        const __filename = fileURLToPath( import.meta.url )
        __dirname        = join( dirname( __filename ), '..' )
    } else {
        throw new Error( 'Unable to retrieve module dirname.' )
    }

    return __dirname

}

const __dirname    = getDirname()
const packagePath  = join( __dirname, 'package.json' )
const packageData  = readFileSync( packagePath )
const packageInfos = JSON.parse( packageData )

class Indenter {

    _          = ''
    __         = ''
    ___        = ''
    ____       = ''
    _____      = ''
    ______     = ''
    _______    = ''
    ________   = ''
    _________  = ''
    __________ = ''

    constructor( indentationChar = '\t', maxIndentationLevel = 10 ) {

        let currentProperty = '_'
        for ( let currentIndentationLevel = 1 ; currentIndentationLevel <= maxIndentationLevel ; currentIndentationLevel++ ) {
            this[ currentProperty ] = indentationChar.repeat( currentIndentationLevel )
            currentProperty += '_'
        }

    }

}

export {
    packageInfos,
    Indenter,
    getDirname
}