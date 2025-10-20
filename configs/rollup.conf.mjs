/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module configs/Rollup
 * @description The file manage the rollup configuration for build the library using differents arguments. It allow to build with two type of environment (dev and prod), and differents output format.
 * Use npm run help to display all available build options.
 *
 * @requires {@link module: [path]{@link https://nodejs.org/api/path.html}}
 * @requires {@link module: [rollup-plugin-commonjs]{@link https://github.com/rollup/rollup-plugin-commonjs}}
 * @requires {@link module: [rollup-plugin-node-resolve]{@link https://github.com/rollup/rollup-plugin-node-resolve}}
 * @requires {@link module: [rollup-plugin-terser]{@link https://github.com/TrySound/rollup-plugin-terser}}
 *
 */

import { readFileSync }  from 'fs'
import {
    dirname,
    join,
    basename
}                        from 'path'
import commonjs          from '@rollup/plugin-commonjs'
import nodeResolve       from '@rollup/plugin-node-resolve'
import { terser }        from 'rollup-plugin-terser'
import cleanup           from 'rollup-plugin-cleanup'
import replace           from 'rollup-plugin-re'
import figlet            from 'figlet'
import { fileURLToPath } from 'url'

const __filename   = fileURLToPath( import.meta.url )
const __dirname    = dirname( __filename )
const packagePath  = join( __dirname, '..', 'package.json' )
const packageData  = readFileSync( packagePath )
const packageInfos = JSON.parse( packageData )

// Utils

function getPrettyPackageName() {

    let packageName = ''

    const nameSplits = packageInfos.name.split( '-' )
    for ( const nameSplit of nameSplits ) {
        packageName += nameSplit.charAt( 0 ).toUpperCase() + nameSplit.slice( 1 ) + '.'
    }
    packageName = packageName.slice( 0, -1 )

    return packageName

}

function getPrettyPackageVersion() {

    return 'v' + packageInfos.version

}

function getPrettyFormatForBanner( format ) {

    let prettyFormat = ''

    switch ( format ) {

        case 'cjs':
            prettyFormat = 'CommonJs'
            break

        case 'esm':
            prettyFormat = 'EsModule'
            break

        case 'iife':
            prettyFormat = 'Standalone'
            break

        case 'umd':
            prettyFormat = 'Universal'
            break

        default:
            throw new RangeError( `Invalid switch parameter: ${ format }` )

    }

    return prettyFormat

}

function _commentarize( banner ) {

    let bannerCommented = '/**\n'
    bannerCommented += ' * '
    bannerCommented += banner.replaceAll( '\n', '\n * ' )
    bannerCommented += '\n'
    bannerCommented += ` * @desc    ${ packageInfos.description }\n`
    bannerCommented += ' * @author  [Tristan Valcke]{@link https://github.com/Itee}\n'
    bannerCommented += ' * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}\n'
    bannerCommented += ' * \n'
    bannerCommented += ' */'

    return bannerCommented

}

function _computeBanner( format ) {

    const packageName    = getPrettyPackageName()
    const packageVersion = getPrettyPackageVersion()
    const prettyFormat   = getPrettyFormatForBanner( format )

    const figText = figlet.textSync(
        `${ packageName } ${ packageVersion } - ${ prettyFormat }`,
        {
            font:             'Tmplr',
            horizontalLayout: 'default',
            verticalLayout:   'default',
            whitespaceBreak:  true,
        }
    )

    return _commentarize( figText )

}

function _computeIntro() {

    return '' +
        'if( iteeValidators === undefined ) { throw new Error(\'Itee.Client need Itee.Validators to be defined first. Please check your scripts loading order.\') }' + '\n' +
        'if( iteeUtils === undefined ) { throw new Error(\'Itee.Client need Itee.Utils to be defined first. Please check your scripts loading order.\') }' + '\n' +
        'if( iteeCore === undefined ) { throw new Error(\'Itee.Client need Itee.Core to be defined first. Please check your scripts loading order.\') }' + '\n'

}

// Configs

const configs = {
    'benchmarks-backend':  {
        input:    `tests/benchmarks/${packageInfos.name}.benchs.js`,
        external: [
            'benchmark',
            'express',
            'http',
            'https',
            'fs',
            'path',
            'crypto'
        ],
        plugins: [
            nodeResolve( {
                preferBuiltins: true
            } ),
            cleanup( {
                comments: 'none'
            } )
        ],
        treeshake: true,
        output:    {
            indent: '\t',
            format: 'cjs',
            name:   'Itee.Benchs',
            file:   `tests/benchmarks/builds/${packageInfos.name}.benchs.cjs.js`
        }
    },
    'benchmarks-frontend': {},
    'units-backend':       {
        input:    `tests/units/${packageInfos.name}.units.js`,
        external: [
            'mocha',
            'chai',
            'express'
        ],
        plugins: [
            nodeResolve( {
                preferBuiltins: true
            } ),
            cleanup( {
                comments: 'none'
            } )
        ],
        treeshake: true,
        output:    {
            indent: '\t',
            format: 'cjs',
            name:   'Itee.Units',
            file:   `tests/units/builds/${packageInfos.name}.units.cjs.js`
        }
    },
    'units-frontend':      {},
}

function getRollupConfigurationFor( bundleName ) {

    return configs[ bundleName ]

}

/**
 * Will create an appropriate configuration object for rollup, related to the given arguments.
 *
 * @generator
 * @param options
 * @return {Array.<json>} An array of rollup configuration
 */
function CreateRollupConfigs( options ) {
    'use strict'

    const {
              input,
              output,
              formats,
              envs,
              treeshake
          }        = options
    const name     = getPrettyPackageName()
    const fileName = basename( input, '.js' )

    const configs = []

    for ( let formatIndex = 0, numberOfFormats = formats.length ; formatIndex < numberOfFormats ; ++formatIndex ) {

        for ( let envIndex = 0, numberOfEnvs = envs.length ; envIndex < numberOfEnvs ; envIndex++ ) {

            const env        = envs[ envIndex ]
            const isProd     = ( env.includes( 'prod' ) )
            const format     = formats[ formatIndex ]
            const outputPath = ( isProd ) ? join( output, `${ fileName }.${ format }.min.js` ) : join( output, `${ fileName }.${ format }.js` )

            configs.push( {
                input:    input,
                external: [
                    'path',
                    'buffer',
                    'fs',
                    'stream',
                    'crypto',

                    'itee-validators',
                    'itee-utils',
                    'itee-core'
                ],
                plugins: [
                    commonjs( {
                        include: 'node_modules/**'
                    } ),
                    nodeResolve( {
                        preferBuiltins: true
                    } ),
                    isProd && terser()
                ],
                onwarn: ( {
                    loc,
                    frame,
                    message
                } ) => {

                    if ( loc ) {
                        process.stderr.write( `/!\\ ${ loc.file } (${ loc.line }:${ loc.column }) ${ frame } ${ message }\n` )
                    } else {
                        process.stderr.write( `/!\\ ${ message }\n` )
                    }

                },
                treeshake: treeshake,
                output:    {
                    // core options
                    file:    outputPath,
                    format:  format,
                    name:    name,
                    globals: {},

                    // advanced options
                    paths:     {},
                    banner:    ( isProd ) ? '' : _computeBanner( format ),
                    footer:    '',
                    intro:     ( !isProd && format === 'iife' ) ? _computeIntro() : '',
                    outro:     '',
                    sourcemap: !isProd,
                    interop:   true,

                    // danger zone
                    exports: 'auto',
                    amd:     {},
                    indent:  '\t',
                    strict:  true
                }
            } )

        }

    }

    return configs

}

export {
    getRollupConfigurationFor,
    CreateRollupConfigs
}

