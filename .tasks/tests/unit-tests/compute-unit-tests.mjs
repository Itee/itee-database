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
import glob                     from 'glob'
import {
    existsSync,
    mkdirSync,
    writeFileSync
}                               from 'fs'
import log                      from 'fancy-log'
import colors                   from 'ansi-colors'
import { getGulpConfigForTask } from '../../../configs/gulp.conf.mjs'
import childProcess             from 'child_process'
import { isNotEmptyArray }      from 'itee-validators'

const {
          red,
          green,
          yellow
      } = colors

function computeUnitTests( done ) {

    const baseDir    = getDirname()
    const sourcesDir = join( baseDir, 'sources' )
    const testsDir   = join( baseDir, 'tests' )
    const unitsDir   = join( testsDir, 'units' )

    if ( !existsSync( unitsDir ) ) {
        log( 'Creating', green( unitsDir ) )
        mkdirSync( unitsDir, { recursive: true } )
    }

    const filePathsToIgnore = getGulpConfigForTask( 'compute-unit-tests' )

    const sourcesFiles = glob.sync( join( sourcesDir, '**' ) )
                             .map( filePath => normalize( filePath ) )
                             .filter( filePath => {
                                 const fileName         = basename( filePath )
                                 const isJsFile         = fileName.endsWith( '.js' )
                                 const isNotPrivateFile = !fileName.startsWith( '_' )
                                 const isNotIgnoredFile = !filePathsToIgnore.includes( fileName )
                                 return isJsFile && isNotPrivateFile && isNotIgnoredFile
                             } )

    const unitsImportMap = []
    for ( let sourceFile of sourcesFiles ) {

        const specificFilePath = sourceFile.replace( sourcesDir, '' )
        const specificDir      = dirname( specificFilePath )

        const fileName     = basename( sourceFile, extname( sourceFile ) )
        const unitFileName = `${ fileName }.unit.js`
        const unitDirPath  = join( unitsDir, specificDir )
        const unitFilePath = join( unitDirPath, unitFileName )

        const nsName         = `${ fileName }Namespace`
        const unitName       = `${ fileName }Units`
        const importDirPath  = relative( unitDirPath, sourcesDir )
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

                const undocumented = data.undocumented
                if ( undocumented ) {
                    return false
                }

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

            let describes = ''
            const I       = n => '\t'.repeat( n )
            I._           = I( 1 )
            I.__          = I( 2 )
            I.___         = I( 3 )
            I.____        = I( 4 )
            I._____       = I( 5 )

            for ( let docData of jsonData ) {

                try {

                    //check input parameters and types
                    const docParameters = docData.params || []
                    const parameters    = []
                    for ( let pIndex = 0 ; pIndex < docParameters.length ; pIndex++ ) {
                        const param   = docParameters[ pIndex ]
                        let paramName = param.name
                        if ( !paramName ) {
                            paramName = `param${ pIndex }`
                            // eslint-disable-next-line no-console
                            console.warn( `Missing parameter name for [${ docData.longname }]. Defaulting to [${ paramName }]` )
                        }

                        const paramType = param.type
                        if ( !paramType ) {
                            throw new ReferenceError( `Missing parameter type. Unable to create unit test for [${ docData.longname }] !` )
                        }

                        const parameter = {
                            name:  paramName,
                            types: []
                        }

                        const paramTypeNames = paramType.names
                        for ( let type of paramTypeNames ) {
                            parameter.types.push( type )
                        }

                        parameters.push( parameter )
                    }

                    // Check returns types
                    const docReturns = docData.returns || []
                    const returns    = []
                    for ( let docReturn of docReturns ) {
                        const returnType = docReturn.type
                        if ( !returnType ) {
                            throw new ReferenceError( `Missing return type for [${ docData.longname }]. Ignore current target !` )
                        }
                        returns.push( ...returnType.names )
                    }

                    // Todo check throws

                    // Get user define rules
                    // const rules = []


                    // Infer basic rules
                    let its = ''

                    if ( parameters.length === 0 ) {

                        if ( returns.length === 0 ) {

                            const result = `${ I( 1 + 1 + 1 + 1 ) }const result = ${ nsName }.${ docData.name }()` + '\n'
                            const expect = `${ I( 1 + 1 + 1 + 1 ) }expect(result).to.be.a('undefined')` + '\n'

                            its += '' +
                                `${ I( 1 + 1 + 1 ) }it( 'return type is undefined', () => {` + '\n' +
                                '\n' +
                                `${ result }` +
                                `${ expect }` +
                                '\n' +
                                `${ I( 1 + 1 + 1 ) }} )` + '\n'

                        } else if ( returns.length === 1 ) {

                            const firstReturnType = returns[ 0 ]
                            const lowerName       = firstReturnType.toLowerCase()

                            const result = `${ I( 1 + 1 + 1 + 1 ) }const result = ${ nsName }.${ docData.name }()` + '\n'

                            let expect = ''
                            if ( lowerName.startsWith( 'array' ) ) {
                                //todo array of...
                                expect += `${ I( 1 + 1 + 1 + 1 ) }expect(result).to.be.a('array')` + '\n'
                            } else {
                                expect += `${ I( 1 + 1 + 1 + 1 ) }expect(result).to.be.a('${ lowerName }')` + '\n'
                            }

                            its += '' +
                                `${ I( 1 + 1 + 1 ) }it( 'return type is ${ lowerName }', () => {` + '\n' +
                                '\n' +
                                `${ result }` +
                                `${ expect }` +
                                '\n' +
                                `${ I( 1 + 1 + 1 ) }} )` + '\n'

                        } else {

                            const result = `${ I( 1 + 1 + 1 + 1 ) }const result = ${ nsName }.${ docData.name }()` + '\n'

                            let returnTypesLabel = []
                            let expects          = []
                            for ( let returnType of returns ) {

                                const lowerName = returnType.toLowerCase()
                                returnTypesLabel.push( lowerName )

                                if ( lowerName.startsWith( 'array' ) ) {
                                    expects.push( `expect(result).to.be.a('array')` )
                                    //todo array of...
                                } else {
                                    expects.push( `expect(result).to.be.a('${ lowerName }')` )
                                }

                            }

                            let indent   = 1 + 1 + 1 + 1
                            let openTry  = ''
                            let closeTry = ''
                            for ( let expect of expects ) {
                                openTry += '' +
                                    `${ I( indent ) }try {` + '\n' +
                                    `${ I( indent + 1 ) }${ expect }` + '\n' +
                                    `${ I( indent ) }} catch(e) {` + '\n'

                                closeTry = `${ I( indent ) }}` + '\n' + `${ closeTry }`

                                indent++
                            }
                            const _expect = '' +
                                `${ openTry }` +
                                `${ I( indent ) }expect.fail("expect result to be of type ${ returnTypesLabel.join( ' or ' ) }")` + '\n' +
                                `${ closeTry }`

                            its += '' +
                                `${ I( 1 + 1 + 1 ) }it( 'return type is ${ returnTypesLabel.join( ' or ' ) }', () => {` + '\n' +
                                '\n' +
                                `${ result }` +
                                `${ _expect }` +
                                '\n' +
                                `${ I( 1 + 1 + 1 ) }} )` + '\n'

                        }

                    } else {

                        if ( returns.length === 0 ) {

                            let itDeclaration = []
                            let index         = 0
                            let indent        = 1 + 1 + 1 + 1
                            let localIndent   = indent
                            let dataSets      = ''
                            let forLoopOpens  = ''
                            let forLoopCloses = ''
                            let args          = []
                            for ( let parameter of parameters ) {

                                const parameterType = parameter.types[ 0 ]
                                itDeclaration.push( `${ parameter.name } is of type ${ parameterType }` )

                                dataSets += `${ I( indent ) }const dataSet${ index } = this._dataMap[ '${ parameterType }s' ]` + '\n'
                                forLoopOpens += '' + '\n' +
                                    `${ I( localIndent ) }for ( let key${ index } in dataSet${ index } ) {` + '\n' +
                                    `${ I( localIndent + 1 ) }const dataSetValue${ index } = dataSet${ index }[ key${ index } ]` + '\n'

                                args.push( `dataSetValue${ index }` )

                                forLoopCloses = `${ I( localIndent ) }}` + '\n' + `${ forLoopCloses }`

                                index++
                                localIndent++
                            }

                            const result = `${ I( localIndent ) }const result = ${ nsName }.${ docData.name }( ${ args.join( ', ' ) } )` + '\n'
                            const expect = `${ I( localIndent ) }expect(result).to.be.a('undefined')` + '\n'

                            const param = '' +
                                `${ dataSets }` +
                                `${ forLoopOpens }` +
                                `${ result }` +
                                `${ expect }` +
                                `${ forLoopCloses }`

                            its += '' +
                                `${ I( 1 + 1 + 1 ) }it( 'return type is undefined when ${ itDeclaration.join( ' and ' ) }', () => {` + '\n' +
                                '\n' +
                                `${ param }` +
                                '\n' +
                                `${ I( 1 + 1 + 1 ) }} )` + '\n'

                        } else if ( returns.length === 1 ) {

                            const firstReturnType = returns[ 0 ]
                            const lowerName       = firstReturnType.toLowerCase()

                            let itDeclaration = []
                            let index         = 0
                            let indent        = 1 + 1 + 1 + 1
                            let localIndent   = indent
                            let dataSets      = ''
                            let forLoopOpens  = ''
                            let forLoopCloses = ''
                            let args          = []
                            for ( let parameter of parameters ) {

                                const parameterType = parameter.types[ 0 ]
                                const isAnyType     = ( parameterType === '*' || parameterType.toLowerCase() === 'any' )
                                const declaration   = ( isAnyType )
                                                      ? `${ parameter.name } is of any type`
                                                      : `${ parameter.name } is of type ${ parameterType }`
                                itDeclaration.push( declaration )

                                if ( isAnyType ) {

                                    dataSets += `${ I( indent ) }const dataMap${ index } = this._dataMap` + '\n' +
                                        `${ I( localIndent ) }for ( let dataSetKey${ index } in dataMap${ index } ) {` + '\n'

                                    localIndent++
                                    dataSets += `${ I( indent + 1 ) }const dataSet${ index } = dataMap${ index }[ dataSetKey${ index } ]` + '\n'
                                    forLoopOpens += '' + '\n' +
                                        `${ I( localIndent ) }for ( let key${ index } in dataSet${ index } ) {` + '\n' +
                                        `${ I( localIndent + 1 ) }const dataSetValue${ index } = dataSet${ index }[ key${ index } ]` + '\n'

                                    args.push( `dataSetValue${ index }` )

                                    forLoopCloses = `${ I( localIndent ) }}` + '\n' +
                                        `${ I( localIndent - 1 ) }}` + '\n' +
                                        `${ forLoopCloses }`

                                } else {

                                    dataSets += `${ I( indent ) }const dataSet${ index } = this._dataMap[ '${ parameterType }s' ]` + '\n'
                                    forLoopOpens += '' + '\n' +
                                        `${ I( localIndent ) }for ( let key${ index } in dataSet${ index } ) {` + '\n' +
                                        `${ I( localIndent + 1 ) }const dataSetValue${ index } = dataSet${ index }[ key${ index } ]` + '\n'

                                    args.push( `dataSetValue${ index }` )

                                    forLoopCloses = `${ I( localIndent ) }}` + '\n' + `${ forLoopCloses }`

                                }


                                index++
                                localIndent++
                            }

                            const result = `${ I( localIndent ) }const result = ${ nsName }.${ docData.name }( ${ args.join( ', ' ) } )` + '\n'

                            let expect = ''
                            if ( lowerName.startsWith( 'array' ) ) {
                                expect = `${ I( localIndent ) }expect(result).to.be.a('array')` + '\n'
                                //todo array of...
                            } else {
                                expect = `${ I( localIndent ) }expect(result).to.be.a('${ lowerName }')` + '\n'
                            }

                            const param = '' +
                                `${ dataSets }` +
                                `${ forLoopOpens }` +
                                `${ result }` +
                                `${ expect }` +
                                `${ forLoopCloses }`

                            its += '' +
                                `${ I( 1 + 1 + 1 ) }it( 'return type is ${ lowerName } when ${ itDeclaration.join( ' and ' ) }', () => {` + '\n' +
                                '\n' +
                                `${ param }` +
                                '\n' +
                                `${ I( 1 + 1 + 1 ) }} )` + '\n'

                        } else {

                            let itDeclaration = []
                            let index         = 0
                            let indent        = 1 + 1 + 1 + 1
                            let localIndent   = indent
                            let dataSets      = ''
                            let forLoopOpens  = ''
                            let forLoopCloses = ''
                            let args          = []
                            for ( let parameter of parameters ) {

                                const parameterType = parameter.types[ 0 ]
                                itDeclaration.push( `${ parameter.name } is of type ${ parameterType }` )

                                dataSets += `${ I( indent ) }const dataSet${ index } = this._dataMap[ '${ parameterType }s' ]` + '\n'
                                forLoopOpens += '' + '\n' +
                                    `${ I( localIndent ) }for ( let key${ index } in dataSet${ index } ) {` + '\n' +
                                    `${ I( localIndent + 1 ) }const dataSetValue${ index } = dataSet${ index }[ key${ index } ]` + '\n'

                                args.push( `dataSetValue${ index }` )

                                forLoopCloses = `${ I( localIndent ) }}` + '\n' + `${ forLoopCloses }`

                                index++
                                localIndent++
                            }

                            const result = `${ I( localIndent ) }const result = ${ nsName }.${ docData.name }( ${ args.join( ', ' ) } )` + '\n'

                            let returnTypesLabel = []
                            let expects          = []
                            for ( let returnType of returns ) {

                                const lowerName = returnType.toLowerCase()
                                returnTypesLabel.push( lowerName )

                                if ( lowerName.startsWith( 'array' ) ) {
                                    expects.push( `expect(result).to.be.a('array')` )
                                    //todo array of...
                                } else {
                                    expects.push( `expect(result).to.be.a('${ lowerName }')` )
                                }

                            }
                            let openTry  = ''
                            let closeTry = ''
                            for ( let expect of expects ) {
                                openTry += '' +
                                    `${ I( localIndent ) }try {` + '\n' +
                                    `${ I( localIndent + 1 ) }${ expect }` + '\n' +
                                    `${ I( localIndent ) }} catch(e) {` + '\n'

                                closeTry = `${ I( localIndent ) }}` + '\n' + `${ closeTry }`

                                localIndent++
                            }
                            const _expect = '' +
                                `${ openTry }` +
                                `${ I( localIndent ) }expect.fail("expect result to be of type ${ returnTypesLabel.join( ' or ' ) }")` + '\n' +
                                `${ closeTry }`

                            const param = '' +
                                `${ dataSets }` +
                                `${ forLoopOpens }` +
                                `${ result }` +
                                `${ _expect }` +
                                `${ forLoopCloses }`

                            its += '' +
                                `${ I( 1 + 1 + 1 ) }it( 'return type is ${ returnTypesLabel.join( ' or ' ) } when ${ itDeclaration.join( ' and ' ) }', () => {` + '\n' +
                                '\n' +
                                `${ param }` +
                                '\n' +
                                `${ I( 1 + 1 + 1 ) }} )` + '\n'

                        }

                    }

                    describes += '' +
                        `${ I.__ }describe( '${ docData.name }()', () => {` + '\n' +
                        '\n' +
                        `${ I.___ }it( 'is bundlable', () => {` + '\n' +
                        '\n' +
                        `${ I.____ }expect(${ nsName }.${ docData.name }).to.exist` + '\n' +
                        '\n' +
                        `${ I.___ }} )` + '\n' +
                        '\n' +
                        `${ its }` +
                        '\n' +
                        `${ I.__ }} )` + '\n' +
                        '\n'

                } catch ( error ) {

                    log( red( error.message ) )

                }

            }

            const template = '' +
                `import { expect }       from 'chai'` + '\n' +
                `import { beforeEach, afterEach, describe, it } from 'mocha'` + '\n' +
                `import { Testing }      from 'itee-utils'` + '\n' +
                `import * as ${ nsName } from '${ importFilePath }'` + '\n' +
                '\n' +
                `function ${ unitName } () {` + '\n' +
                '\n' +
                `${ I( 1 ) }beforeEach( () => {` + '\n' +
                '\n' +
                `${ I( 1 + 1 ) }this._dataMap = Testing.createDataMap()` + '\n' +
                '\n' +
                `${ I( 1 ) }} )` + '\n' +
                '\n' +
                `${ I( 1 ) }afterEach( () => {` + '\n' +
                '\n' +
                `${ I( 1 + 1 ) }delete this._dataMap` + '\n' +
                '\n' +
                `${ I( 1 ) }} )` + '\n' +
                '\n' +
                `${ I( 1 ) }describe( '${ unitName }', () => {` + '\n' +
                '\n' +
                `${ describes }` +
                '' +
                `${ I( 1 ) }} )` + '\n' +
                '\n' +
                '}' + '\n' +
                '\n' +
                `export { ${ unitName } }` + '\n' +
                '\n'

            const importUnitFilePath = relative( unitsDir, unitFilePath )
            unitsImportMap.push( {
                exportName: unitName,
                path:       importUnitFilePath.replace( /\\/g, '/' )
            } )

            log( green( `Create ${ unitFilePath }` ) )
            mkdirSync( unitDirPath, { recursive: true } )
            writeFileSync( unitFilePath, template )

        } catch ( error ) {

            log( red( error.message ) )

        }

    }

    // If some tests to import generate global units file
    let unitsTemplate
    if ( isNotEmptyArray( unitsImportMap ) ) {

        let computedImports   = ''
        let computedUnitCalls = ''
        for ( let entry of unitsImportMap ) {
            computedImports += `import { ${ entry.exportName } }   from './${ entry.path }'` + '\n'
            computedUnitCalls += `    ${ entry.exportName }.call( root )` + '\n'
        }

        unitsTemplate = '' +
            'import { describe }      from \'mocha\'' + '\n' +
            `${ computedImports }` +
            '\n' +
            'const root = typeof window === \'undefined\'' + '\n' +
            '    ? typeof global === \'undefined\'' + '\n' +
            '        ? Function( \'return this\' )() ' + '\n' +
            '        : global ' + '\n' +
            '    : window' + '\n' +
            '\n' +
            'describe( \'Itee#Validators\', () => {' + '\n' +
            '\n' +
            `${ computedUnitCalls }` +
            '\n' +
            '} )' + '\n'

    } else {

        log( yellow( 'No tests were generated. Create fallback global root import file.' ) )

        unitsTemplate = '' +
            'import { describe }      from \'mocha\'' + '\n' +
            '\n' +
            'describe( \'Itee#Validators\', () => {} )' + '\n'

    }

    const unitsFilePath = join( unitsDir, `${ packageInfos.name }.units.js` )

    log( 'Creating', green( unitsFilePath ) )
    writeFileSync( unitsFilePath, unitsTemplate )

    done()

}

export { computeUnitTests }