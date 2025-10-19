import {
    join,
    normalize,
    basename,
    dirname,
    extname,
    relative
}                               from 'path'
import {
    getDirname,
    packageInfos
}                               from '../../_utils.mjs'
import glob from 'glob'
import {
    existsSync,
    mkdirSync,
    writeFileSync
} from 'fs'
import log  from 'fancy-log'
import colors                   from 'ansi-colors'
import { getGulpConfigForTask } from '../../../configs/gulp.conf.mjs'
import childProcess             from 'child_process'
import { isNotEmptyArray }      from 'itee-validators'

const {
          red,
          green,
          yellow
      } = colors

function computeBenchmarks( done ) {

    const baseDir    = getDirname()
    const sourcesDir = join( baseDir, 'sources' )
    const testsDir   = join( baseDir, 'tests' )
    const benchesDir = join( testsDir, 'benchmarks' )

    if ( !existsSync( benchesDir ) ) {
        log( 'Creating', green( benchesDir ) )
        mkdirSync( benchesDir, { recursive: true } )
    }

    const filePathsToIgnore = getGulpConfigForTask( 'compute-benchmarks' )

    const sourcesFiles = glob.sync( join( sourcesDir, '**' ) )
                             .map( filePath => normalize( filePath ) )
                             .filter( filePath => {
                                 const fileName         = basename( filePath )
                                 const isJsFile         = fileName.endsWith( '.js' )
                                 const isNotPrivateFile = !fileName.startsWith( '_' )
                                 const isNotIgnoredFile = !filePathsToIgnore.includes( fileName )
                                 return isJsFile && isNotPrivateFile && isNotIgnoredFile
                             } )

    const benchRootImports = []
    for ( let sourceFile of sourcesFiles ) {

        const specificFilePath = sourceFile.replace( sourcesDir, '' )
        const specificDir      = dirname( specificFilePath )

        const fileName      = basename( sourceFile, extname( sourceFile ) )
        const benchFileName = `${ fileName }.bench.js`
        const benchDirPath  = join( benchesDir, specificDir )
        const benchFilePath = join( benchDirPath, benchFileName )

        const nsName         = `${ fileName }Namespace`
        const importDirPath  = relative( benchDirPath, sourcesDir )
        const importFilePath = join( importDirPath, specificFilePath ).replace( /\\/g, '/' )

        try {

            const jsdocPath   = join( baseDir, '/node_modules/jsdoc/jsdoc.js' )
            const jsdocOutput = childProcess.execFileSync( 'node', [ jsdocPath, '-X', sourceFile ] ).toString()

            const classNames    = []
            const usedLongnames = []
            const jsonData      = JSON.parse( jsdocOutput ).filter( data => {

                const longName = data.longname

                const kind = data.kind
                if ( kind !== 'function' ) {
                    if ( kind === 'class' && !classNames.includes( longName ) ) {
                        classNames.push( longName )
                    }
                    return false
                }

                // We don't care that data bloc have comment they are unused to generate benchmarks
                // const undocumented = data.undocumented
                // if ( undocumented ) {
                //     return false
                // }

                const scope = data.scope
                if ( ![ 'global', 'static' ].includes( scope ) ) {
                    return false
                }

                if ( longName.includes( ' ' ) || longName.includes( '~' ) || usedLongnames.includes( longName ) ) {
                    return false
                }

                for ( let className of classNames ) {
                    if ( longName.includes( className ) ) {
                        return false
                    }
                }

                usedLongnames.push( longName )

                return true

            } )

            if ( jsonData.length === 0 ) {
                log( yellow( `No usable exports found in [${ sourceFile }]. Ignore it !` ) )
                continue
            }

            // Compute benchmark suites by grouping logically function by name[_x]
            const suiteGroups = {}
            for ( let docData of jsonData ) {

                try {

                    const functionName = docData.name
                    const nameSplits   = functionName.split( '_' )
                    const rootName     = nameSplits[ 0 ]

                    if ( !( rootName in suiteGroups ) ) {
                        suiteGroups[ rootName ] = []
                    }

                    suiteGroups[ rootName ].push( functionName )

                } catch ( error ) {

                    log( red( error.message ) )

                }

            }

            // Generate suites
            let benchSuites       = ''
            const suitesToExports = []
            for ( let suiteGroupName in suiteGroups ) {
                suitesToExports.push( `${ suiteGroupName }Suite` )
                benchSuites += `const ${ suiteGroupName }Suite = Benchmark.Suite( '${ nsName }.${ suiteGroupName }', Testing.createSuiteOptions() )` + '\n'

                for ( let suiteGroupValue of suiteGroups[ suiteGroupName ] ) {
                    benchSuites += `                                     .add( '${ suiteGroupValue }()', Testing.iterateOverDataMap( ${ nsName }.${ suiteGroupValue } ), Testing.createBenchmarkOptions() )` + '\n'
                }

                benchSuites += '\n'
            }

            const template = '' + '\n' +
                `import Benchmark   from 'benchmark'` + '\n' +
                `import { Testing }      from 'itee-utils'` + '\n' +
                `import * as ${ nsName } from '${ importFilePath }'` + '\n' +
                '\n' +
                `${ benchSuites }` +
                // '\n' +
                `export { ${ suitesToExports } }` + '\n' +
                '\n'

            const importBenchFilePath = relative( benchesDir, benchFilePath ).replace( /\\/g, '/' )
            benchRootImports.push( {
                path:    importBenchFilePath,
                exports: suitesToExports
            } )

            log( green( `Create ${ benchFilePath }` ) )
            mkdirSync( benchDirPath, { recursive: true } )
            writeFileSync( benchFilePath, template )

        } catch ( error ) {

            log( red( error.message ) )

        }

    }

    let templateImports = ''
    let suites          = []
    for ( let i = 0 ; i < benchRootImports.length ; i++ ) {

        const currentBench = benchRootImports[ i ]
        const exports      = currentBench.exports
        const imports      = exports.join( ', ' )
        suites.push( ...exports )

        templateImports += `import {${ imports }} from './${ currentBench.path }'` + '\n'

    }

    const benchesTemplate = '' +
        `${ templateImports }` + '\n' +
        'const suites = [' + '\n' +
        `${ suites.map( suite => `\t${ suite }` ).join( ',\n' ) }` + '\n' +
        ']' + '\n' +
        '\n' +
        `for ( const suite of suites ) {` + '\n' +
        `\tsuite.run()` + '\n' +
        `}` + '\n'

    const benchesFilePath = join( benchesDir, `${ packageInfos.name }.benchs.js` )

    log( green( `Create ${ benchesFilePath }` ) )
    writeFileSync( benchesFilePath, benchesTemplate )

    done()

}

export { computeBenchmarks }