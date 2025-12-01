import colors              from 'ansi-colors'
import childProcess        from 'child_process'
import log                 from 'fancy-log'
import { isNotEmptyArray } from 'itee-validators'
import {
    basename,
    dirname,
    extname,
    join,
    relative
}                          from 'path'
import {
    createDirectoryIfNotExist,
    createFile,
    getPrettyPackageName,
    Indenter,
    nodeModulesDirectory,
    packageName,
    packageRootDirectory,
    packageSourcesDirectory as sourcesDir,
    packageTestsUnitsDirectory as unitsDir
}                          from '../../_utils.mjs'
import { sourcesFiles }    from '../../configs/compute-unit-tests.conf.mjs'

const {
          red,
          green,
          blue,
          yellow
      } = colors

/**
 * @description Will generate unit test files from source code using type inference from comments
 */
const computeUnitTestsTask       = ( done ) => {

    createDirectoryIfNotExist( unitsDir )

    const unitsImportMap = []
    for ( let sourceFile of sourcesFiles ) {

        const specificFilePath = sourceFile.replace( sourcesDir, '' )
        const specificDir      = dirname( specificFilePath )

        const fileName     = basename( sourceFile, extname( sourceFile ) )
        const unitFileName = `${ fileName }.unit.mjs`
        const unitDirPath  = join( unitsDir, specificDir )
        const unitFilePath = join( unitDirPath, unitFileName )

        const nsName         = `${ fileName }Namespace`
        const unitName       = `${ fileName }Units`
        const importDirPath  = relative( unitDirPath, sourcesDir )
        const importFilePath = join( importDirPath, specificFilePath ).replace( /\\/g, '/' )

        try {

            const jsdocPath   = join( nodeModulesDirectory, '/jsdoc/jsdoc.js' )
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
                log( 'Ignoring', yellow( `${ sourceFile }, no usable exports found` ) )
                continue
            }

            let describes = ''
            const {
                      I,
                      I_,
                      I__,
                      I___,
                  }       = new Indenter( '\t', 3 )

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
                            log( yellow( `Missing parameter name for [${ docData.longname }]. Defaulting to [${ paramName }]` ) )
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
                    const baseIndent = 2
                    let its          = ''

                    if ( parameters.length === 0 ) {

                        if ( returns.length === 0 ) {

                            const result = `${ I._( baseIndent + 1 ) }const result = ${ nsName }.${ docData.name }()` + '\n'
                            const expect = `${ I._( baseIndent + 1 ) }expect(result).to.be.a('undefined')` + '\n'

                            its += '' +
                                `${ I._( baseIndent ) }it( 'should return undefined value on call', async function () {` + '\n' +
                                '\n' +
                                `${ result }` +
                                `${ expect }` +
                                '\n' +
                                `${ I._( baseIndent ) }} )` + '\n'

                        } else if ( returns.length === 1 ) {

                            const firstReturnType = returns[ 0 ]
                            const lowerName       = firstReturnType.toLowerCase()

                            const result = `${ I._( baseIndent + 1 ) }const result = ${ nsName }.${ docData.name }()` + '\n'

                            let expect = ''
                            if ( lowerName.startsWith( 'array' ) ) {
                                //todo array of...
                                expect += `${ I._( baseIndent + 1 ) }expect(result).to.be.a('array')` + '\n'
                            } else {
                                expect += `${ I._( baseIndent + 1 ) }expect(result).to.be.a('${ lowerName }')` + '\n'
                            }

                            its += '' +
                                `${ I._( baseIndent ) }it( 'should return value of type ${ lowerName }', async function() {` + '\n' +
                                '\n' +
                                `${ result }` +
                                `${ expect }` +
                                '\n' +
                                `${ I._( baseIndent ) }} )` + '\n'

                        } else {

                            const result = `${ I._( baseIndent + 1 ) }const result = ${ nsName }.${ docData.name }()` + '\n'

                            let returnTypesLabel = []
                            let oneOf            = []
                            for ( let returnType of returns ) {

                                const lowerName = returnType.toLowerCase()
                                returnTypesLabel.push( lowerName )

                                if ( lowerName.startsWith( 'array' ) ) {
                                    //todo array of...
                                    oneOf.push( 'array' )
                                } else {
                                    oneOf.push( `'${ lowerName }'` )
                                }

                            }

                            const underlyingType = `${ I._( baseIndent + 1 ) }const resultType = (result === null) ? 'null' : typeof result` + '\n'
                            const expect         = `${ I._( baseIndent + 1 ) }expect(resultType).to.be.oneOf([${ oneOf.join( ',' ) }])` + '\n'

                            its += '' +
                                `${ I._( baseIndent ) }it( 'should return value where type is ${ returnTypesLabel.join( ' or ' ) }', async function() {` + '\n' +
                                '\n' +
                                `${ result }` +
                                `${ underlyingType }` +
                                `${ expect }` +
                                '\n' +
                                `${ I._( baseIndent ) }} )` + '\n'

                        }

                    } else {

                        if ( returns.length === 0 ) {

                            let itDeclaration = []
                            let index         = 0
                            let indent        = baseIndent + 1
                            let localIndent   = indent
                            let dataSets      = ''
                            let forLoopOpens  = ''
                            let forLoopCloses = ''
                            let args          = []
                            for ( let parameter of parameters ) {

                                const parameterType = parameter.types[ 0 ]
                                itDeclaration.push( `${ parameter.name } is of type ${ parameterType }` )

                                dataSets += `${ I._( indent ) }const dataSet${ index } = _dataMap[ '${ parameterType }s' ]` + '\n'
                                // dataSets += `${ I._( indent ) }const dataSet${ index } = this._dataMap[ '${ parameterType }s' ]` + '\n'
                                forLoopOpens += '' + '\n' +
                                    `${ I._( localIndent ) }for ( let key${ index } in dataSet${ index } ) {` + '\n' +
                                    `${ I._( localIndent + 1 ) }const dataSetValue${ index } = dataSet${ index }[ key${ index } ]` + '\n'

                                args.push( `dataSetValue${ index }` )

                                forLoopCloses = `${ I._( localIndent ) }}` + '\n' + `${ forLoopCloses }`

                                index++
                                localIndent++
                            }

                            const result = `${ I._( localIndent ) }const result = ${ nsName }.${ docData.name }( ${ args.join( ', ' ) } )` + '\n'
                            const expect = `${ I._( localIndent ) }expect(result).to.be.a('undefined')` + '\n'

                            const param = '' +
                                `${ dataSets }` +
                                `${ forLoopOpens }` +
                                `${ result }` +
                                `${ expect }` +
                                `${ forLoopCloses }`

                            its += '' +
                                `${ I._( baseIndent ) }it( 'should return undefined value when ${ itDeclaration.join( ' and ' ) }', async function() {` + '\n' +
                                '\n' +
                                `${ param }` +
                                '\n' +
                                `${ I._( baseIndent ) }} )` + '\n'

                        } else if ( returns.length === 1 ) {

                            const firstReturnType = returns[ 0 ]
                            const lowerName       = firstReturnType.toLowerCase()

                            let itDeclaration = []
                            let index         = 0
                            let indent        = baseIndent + 1
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

                                    dataSets += `${ I._( indent ) }const dataMap${ index } = _dataMap` + '\n' +
                                        // dataSets += `${ I._( indent ) }const dataMap${ index } = this._dataMap` + '\n' +
                                        `${ I._( localIndent ) }for ( let dataSetKey${ index } in dataMap${ index } ) {` + '\n'

                                    localIndent++
                                    dataSets += `${ I._( indent + 1 ) }const dataSet${ index } = dataMap${ index }[ dataSetKey${ index } ]` + '\n'
                                    forLoopOpens += '' + '\n' +
                                        `${ I._( localIndent ) }for ( let key${ index } in dataSet${ index } ) {` + '\n' +
                                        `${ I._( localIndent + 1 ) }const dataSetValue${ index } = dataSet${ index }[ key${ index } ]` + '\n'

                                    args.push( `dataSetValue${ index }` )

                                    forLoopCloses = `${ I._( localIndent ) }}` + '\n' +
                                        `${ I._( localIndent - 1 ) }}` + '\n' +
                                        `${ forLoopCloses }`

                                } else {

                                    dataSets += `${ I._( indent ) }const dataSet${ index } = _dataMap[ '${ parameterType }s' ]` + '\n'
                                    // dataSets += `${ I._( indent ) }const dataSet${ index } = this._dataMap[ '${ parameterType }s' ]` + '\n'
                                    forLoopOpens += '' + '\n' +
                                        `${ I._( localIndent ) }for ( let key${ index } in dataSet${ index } ) {` + '\n' +
                                        `${ I._( localIndent + 1 ) }const dataSetValue${ index } = dataSet${ index }[ key${ index } ]` + '\n'

                                    args.push( `dataSetValue${ index }` )

                                    forLoopCloses = `${ I._( localIndent ) }}` + '\n' + `${ forLoopCloses }`

                                }


                                index++
                                localIndent++
                            }

                            const result = `${ I._( localIndent ) }const result = ${ nsName }.${ docData.name }( ${ args.join( ', ' ) } )` + '\n'

                            let expect = ''
                            if ( lowerName.startsWith( 'array' ) ) {
                                expect = `${ I._( localIndent ) }expect(result).to.be.a('array')` + '\n'
                                //todo array of...
                            } else {
                                expect = `${ I._( localIndent ) }expect(result).to.be.a('${ lowerName }')` + '\n'
                            }

                            const param = '' +
                                `${ dataSets }` +
                                `${ forLoopOpens }` +
                                `${ result }` +
                                `${ expect }` +
                                `${ forLoopCloses }`

                            its += '' +
                                `${ I._( baseIndent ) }it( 'should return value of type ${ lowerName } when ${ itDeclaration.join( ' and ' ) }', async function() {` + '\n' +
                                '\n' +
                                `${ param }` +
                                '\n' +
                                `${ I._( baseIndent ) }} )` + '\n'

                        } else {

                            let itDeclaration = []
                            let index         = 0
                            let indent        = baseIndent + 1
                            let localIndent   = indent
                            let dataSets      = ''
                            let forLoopOpens  = ''
                            let forLoopCloses = ''
                            let args          = []
                            for ( let parameter of parameters ) {

                                const parameterType = parameter.types[ 0 ]
                                itDeclaration.push( `${ parameter.name } is of type ${ parameterType }` )

                                dataSets += `${ I._( localIndent ) }const dataSet${ index } = _dataMap[ '${ parameterType }s' ]` + '\n'
                                // dataSets += `${ I._( indent ) }const dataSet${ index } = this._dataMap[ '${ parameterType }s' ]` + '\n'
                                forLoopOpens += '' + '\n' +
                                    `${ I._( localIndent ) }for ( let key${ index } in dataSet${ index } ) {` + '\n' +
                                    `${ I._( localIndent + 1 ) }const dataSetValue${ index } = dataSet${ index }[ key${ index } ]` + '\n'

                                args.push( `dataSetValue${ index }` )

                                forLoopCloses = `${ I._( localIndent ) }}` + '\n' + `${ forLoopCloses }`

                                index++
                                localIndent++
                            }

                            const result = `${ I._( localIndent + 1 ) }const result = ${ nsName }.${ docData.name }( ${ args.join( ', ' ) } )` + '\n'

                            let returnTypesLabel = []
                            let oneOf            = []
                            for ( let returnType of returns ) {

                                const lowerName = returnType.toLowerCase()
                                returnTypesLabel.push( lowerName )

                                if ( lowerName.startsWith( 'array' ) ) {
                                    //todo array of...
                                    oneOf.push( 'array' )
                                } else {
                                    oneOf.push( `'${ lowerName }'` )
                                }

                            }

                            const underlyingType = `${ I._( localIndent + 1 ) }const resultType = (result === null) ? 'null' : typeof result` + '\n'
                            const expect         = `${ I._( localIndent + 1 ) }expect(resultType).to.be.oneOf([${ oneOf.join( ',' ) }])` + '\n'

                            const param = '' +
                                `${ dataSets }` +
                                `${ forLoopOpens }` +
                                `${ result }` +
                                `${ underlyingType }` +
                                `${ expect }` +
                                `${ forLoopCloses }`

                            its += '' +
                                `${ I._( baseIndent ) }it( 'should return value of type ${ returnTypesLabel.join( ' or ' ) } when ${ itDeclaration.join( ' and ' ) }', async function() {` + '\n' +
                                '\n' +
                                `${ param }` +
                                '\n' +
                                `${ I._( baseIndent ) }} )` + '\n'

                        }

                    }

                    describes += '' +
                        `${ I_ }describe( '${ docData.name }()', function () {` + '\n' +
                        '\n' +
                        `${ I__ }it( 'should be bundlable', async function () {` + '\n' +
                        '\n' +
                        `${ I___ }expect(${ nsName }.${ docData.name }).to.exist` + '\n' +
                        '\n' +
                        `${ I__ }} )` + '\n' +
                        '\n' +
                        `${ its }` +
                        '\n' +
                        `${ I_ }} )` + '\n' +
                        '\n'

                } catch ( error ) {

                    log( red( error.message ) )

                }

            }

            const template = '' +
                `import { expect }       from 'chai'` + '\n' +
                `import { Testing }      from 'itee-utils/sources/testings/benchmarks.js'` + '\n' +
                `import * as ${ nsName } from '${ importFilePath }'` + '\n' +
                '\n' +
                `describe( '${ unitName }', function () {` + '\n' +
                '\n' +
                `${ I_ }let _dataMap` + '\n' +
                `${ I_ }before( function() {` + '\n' +
                `${ I__ }_dataMap = Testing.createDataMap()` + '\n' +
                `${ I_ }} )` + '\n' +
                '\n' +
                `${ describes }` +
                '' +
                `} )` + '\n'

            const importUnitFilePath = relative( unitsDir, unitFilePath )
            unitsImportMap.push( {
                exportName: unitName,
                path:       importUnitFilePath.replace( /\\/g, '/' )
            } )

            createDirectoryIfNotExist( unitDirPath )
            createFile( unitFilePath, template )

        } catch ( error ) {

            log( red( error.message ) )

        }

    }

    // If some tests to import generate global units file
    let unitsTemplate
    if ( isNotEmptyArray( unitsImportMap ) ) {

        let computedImports = []
        for ( let entry of unitsImportMap ) {
            // computedImports.push(`import { ${ entry.exportName } }   from './${ entry.path }'`)
            computedImports.push( `export * from './${ entry.path }'` )
        }

        unitsTemplate = computedImports.join( '\n' )

    } else {

        log( 'Warning ', yellow( 'No tests were generated. Create fallback global root import file.' ) )
        const defaultUnitsDir  = join( unitsDir, 'default' )
        const defaultUnitsPath = join( defaultUnitsDir, 'default.unit.mjs' )

        createDirectoryIfNotExist( defaultUnitsDir )
        createFile( defaultUnitsPath, '// Avoid web test runner crash on empty benches' )

        const prettyPackageName = getPrettyPackageName( '#' )
        unitsTemplate           = `describe( '${ prettyPackageName }', () => {} )` + '\n'

    }

    const unitsFilePath = join( unitsDir, `${ packageName }.units.mjs` )
    createFile( unitsFilePath, unitsTemplate )

    done()

}
computeUnitTestsTask.displayName = 'compute-unit-tests'
computeUnitTestsTask.description = 'Will generate unit test files from source code using type inference from comments'
computeUnitTestsTask.flags       = null

log( 'Loading ', green( relative( packageRootDirectory, import.meta.filename ) ), `with task ${ blue( computeUnitTestsTask.displayName ) }` )

export { computeUnitTestsTask }