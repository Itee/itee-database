import colors            from 'ansi-colors'
import childProcess      from 'child_process'
import log               from 'fancy-log'
import {
    existsSync,
    mkdirSync,
    readFileSync,
    writeFileSync
}                        from 'fs'
import { glob }          from 'glob'
import {
    parallel,
    series
}                        from 'gulp'
import {
    dirname,
    join,
    normalize,
    relative
}                        from 'path'
import { fileURLToPath } from 'url'

const {
          red,
          green,
          yellow,
          blue,
          magenta,
          cyan
      } = colors

///

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

///

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

///

function createDirectoryIfNotExist( directoryPath ) {

    if ( !existsSync( directoryPath ) ) {
        log( 'Creating', green( directoryPath ) )
        mkdirSync( directoryPath, { recursive: true } )
    }

}

function createFile( filePath, fileContent ) {

    log( 'Creating', green( filePath ) )
    writeFileSync( filePath, fileContent )

}

function getFilesFrom( globPattern, filter = ( any ) => true ) {

    return glob.sync( globPattern )
               .map( filePath => normalize( filePath ) )
               .filter( filter )

}

///

async function getTasksFrom( taskFiles = [] ) {

    const tasks = []
    for ( const taskFile of taskFiles ) {
        const relativeTaskFile = relative( packageRootDirectory, taskFile )

        try {

            const module = await import(taskFile)

            const exportStrings = []
            for ( const moduleKey in module ) {
                const task = module[ moduleKey ]
                tasks.push( task )

                const name         = task.name ?? null
                const displayName  = task.displayName ?? null
                const fullName     = ( moduleKey !== name ) ? `${ blue( moduleKey ) }( ${ magenta( name ) } )` : `${ blue( name ) }`
                const exportAs     = ( displayName ) ? ` as ${ cyan( displayName ) }` : ''
                const exportString = fullName + exportAs
                exportStrings.push( exportString )
            }

            log( 'Process', green( relativeTaskFile ), `with task${ ( exportStrings.length > 1 ) ? 's' : '' }`, exportStrings.join( ', ' ) )

        } catch ( error ) {

            log( 'Error  ', red( relativeTaskFile ), error.message )

        }

    }

    return tasks

}

async function serializeTasksFrom( taskFiles = [] ) {

    const tasks = await getTasksFrom( taskFiles )
    return series( ...tasks )

}

async function parallelizeTasksFrom( taskFiles = [] ) {

    const tasks = await getTasksFrom( taskFiles )
    return parallel( ...tasks )

}

///

function IndenterFactory( indentationChar = '\t', indentationLevel = 5 ) {

    const indentationLevels = {}
    let currentProperty     = 'I_'
    for ( let currentIndentationLevel = 1 ; currentIndentationLevel <= indentationLevel ; currentIndentationLevel++ ) {
        indentationLevels[ currentProperty ] = indentationChar.repeat( currentIndentationLevel )
        currentProperty += '_'
    }

    return {
        I: new Indenter( indentationChar ),
        ...indentationLevels
    }

}

class Indenter {

    constructor( indentationChar = '\t' ) {

        this.indentationChar         = indentationChar
        this.currentIndentationLevel = 0

    }

    _( indentationLevel = null ) {
        return this.indentationChar.repeat( indentationLevel ?? this.currentIndentationLevel )
    }

    deeper( level = 1 ) {
        this.currentIndentationLevel += level
    }

    shallower( level = 1 ) {
        this.currentIndentationLevel -= level
    }

}

///

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

    createDirectoryIfNotExist,
    createFile,
    getFilesFrom,

    getTasksFrom,
    serializeTasksFrom,
    parallelizeTasksFrom,

    IndenterFactory as Indenter
}