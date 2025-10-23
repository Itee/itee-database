import colors            from 'ansi-colors'
import childProcess      from 'child_process'
import log               from 'fancy-log'
import { readFileSync }  from 'fs'
import {
    dirname,
    join
}                        from 'path'
import { fileURLToPath } from 'url'

const red    = colors.red
const yellow = colors.yellow

function getDirname() {

    let __dirname

    if ( import.meta.dirname ) {
        __dirname = import.meta.dirname
    } else if ( import.meta.filename ) {
        __dirname = dirname( import.meta.filename )
    } else if ( import.meta.url ) {
        const __filename = fileURLToPath( import.meta.url )
        __dirname        = dirname( __filename )
    } else {
        throw new Error( 'Unable to retrieve module dirname.' )
    }

    return __dirname

}

function getPackageRootDirectory() {

    const __dirname = getDirname()
    return join( __dirname, '..' )

}

const packageRootDirectory            = getPackageRootDirectory()
const packageJsonPath                 = join( packageRootDirectory, 'package.json' )
const nodeModulesDirectory            = join( packageRootDirectory, 'node_modules' )
const packageBuildsDirectory          = join( packageRootDirectory, 'builds' )
const packageSourcesDirectory         = join( packageRootDirectory, 'sources' )
const packageSourcesBackendDirectory  = join( packageSourcesDirectory, 'backend' )
const packageSourcesCommonDirectory   = join( packageSourcesDirectory, 'common' )
const packageSourcesFrontendDirectory = join( packageSourcesDirectory, 'frontend' )
const packageTestsDirectory           = join( packageRootDirectory, 'tests' )
const packageTestsBenchmarksDirectory = join( packageTestsDirectory, 'benchmarks' )
const packageTestsBundlesDirectory    = join( packageTestsDirectory, 'bundles' )
const packageTestsUnitsDirectory      = join( packageTestsDirectory, 'units' )
const packageDocsDirectory            = join( packageRootDirectory, 'docs' )
const packageTutorialsDirectory       = join( packageRootDirectory, 'tutorials' )

function getPackageJson() {

    const packageData = readFileSync( packageJsonPath )
    return JSON.parse( packageData )

}

const packageJson        = getPackageJson()
const packageName        = packageJson.name
const packageVersion     = packageJson.version
const packageDescription = packageJson.description

function getPrettyPackageName( separator = ' ' ) {

    let prettyPackageName = ''

    const nameSplits = packageName.split( '-' )
    for ( const nameSplit of nameSplits ) {
        prettyPackageName += nameSplit.charAt( 0 ).toUpperCase() + nameSplit.slice( 1 ) + separator
    }
    prettyPackageName = prettyPackageName.slice( 0, -1 )

    return prettyPackageName

}

function getPrettyPackageVersion() {

    return 'v' + packageVersion

}

function getPrettyNodeVersion() {

    let nodeVersion = 'vX.x.ₓ'

    try {
        nodeVersion = childProcess.execFileSync( 'node', [ '--version' ] )
                                  .toString()
                                  .replace( /(\r\n|\n|\r)/gm, '' )
    } catch ( e ) {
        log( red( e ) )

        if ( e.message.includes( 'ENOENT' ) ) {
            nodeVersion += yellow( ' Not seems to be accessible from the path environment.' )
        }
    }

    return ' node: ' + nodeVersion

}

function getPrettyNpmVersion() {

    let npmVersion = 'X.x.ₓ'

    try {
        npmVersion = childProcess.execFileSync( 'npm', [ '--version' ] )
                                 .toString()
                                 .replace( /(\r\n|\n|\r)/gm, '' )
    } catch ( e ) {
        log( red( e ) )

        if ( e.message.includes( 'ENOENT' ) ) {
            npmVersion += yellow( ' Not seems to be accessible from the path environment.' )
        }
    }

    return ' npm:  v' + npmVersion

}

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
    packageRootDirectory,
    packageJsonPath,
    packageBuildsDirectory,
    packageSourcesDirectory,
    packageSourcesBackendDirectory,
    packageSourcesCommonDirectory,
    packageSourcesFrontendDirectory,
    packageTestsDirectory,
    packageTestsBenchmarksDirectory,
    packageTestsBundlesDirectory,
    packageTestsUnitsDirectory,
    packageDocsDirectory,
    packageTutorialsDirectory,
    nodeModulesDirectory,

    packageJson,
    packageName,
    packageVersion,
    packageDescription,
    getPrettyPackageName,
    getPrettyPackageVersion,
    getPrettyNodeVersion,
    getPrettyNpmVersion,

    Indenter
}