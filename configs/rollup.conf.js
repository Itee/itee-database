/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @module config/rollupConfiguration
 *
 * @description The file manage the rollup configuration for build the library using differents arguments. It allow to build with two type of environment (dev and prod), and differents output format.
 * Use npm run help to display all available build options.
 *
 * @requires {@link module: [path]{@link https://nodejs.org/api/path.html}}
 * @requires {@link module: [rollup-plugin-buble]{@link https://github.com/rollup/rollup-plugin-buble}}
 * @requires {@link module: [rollup-plugin-node-resolve]{@link https://github.com/rollup/rollup-plugin-node-resolve}}
 * @requires {@link module: [rollup-plugin-commonjs]{@link https://github.com/rollup/rollup-plugin-commonjs}}
 * @requires {@link module: [rollup-plugin-replace]{@link https://github.com/rollup/rollup-plugin-replace}}
 * @requires {@link module: [rollup-plugin-uglify-es]{@link https://github.com/TrySound/rollup-plugin-uglify}}
 *
 */

/* eslint-env node */

const path        = require( 'path' )
const nodeResolve = require( 'rollup-plugin-node-resolve' )
const commonJs    = require( 'rollup-plugin-commonjs' )
const uglify      = require( 'rollup-plugin-uglify-es' )
const strip       = require( 'rollup-plugin-strip' )
const builtins    = require( 'rollup-plugin-node-builtins' )

/**
 * Will create an appropriate configuration object for rollup, related to the given arguments.
 *
 *
 * @param fileName
 * @param inputPath
 * @param outputPath
 * @param {string} format - The desired module format output. Available values are: 'es', 'cjs', 'amd', 'iife' and 'umd'
 * @param {boolean} onProduction - The building environment. True for production, developement otherwise.
 * @param {boolean} wantSourceMap - Set to true if sourcemap must be include in the output.
 * @returns {object} The rollup configuration
 */
function CreateRollupConfiguration ( fileName, inputPath, outputPath, format, onProduction, wantSourceMap ) {

    const _format        = (format === 'es') ? 'esm' : format
    const _onProduction  = onProduction || false
    const _wantSourceMap = wantSourceMap || false

    const fileExtension  = (_onProduction) ? '.min.js' : '.js'
    const inputFilePath  = path.join( inputPath, fileName + '.js' )
    const outputFilePath = path.join( outputPath, fileName + '.' + _format + fileExtension )

    return {
        inputOptions:  {

            // core options
            input:    inputFilePath,
            external: [
                'path',
                'fs'
            ],
            plugins:  [
                nodeResolve(),
                commonJs( {
                    include: 'node_modules/**'
                } ),
                builtins(),
                onProduction && strip(),
                onProduction && uglify()
            ],

            // advanced options
            onwarn: function onWarn ( { loc, frame, message } ) {
                if ( loc ) {
                    process.stderr.write( `/!\\ WARNING: ${loc.file} (${loc.line}:${loc.column}) ${frame} ${message}\n` )
                } else {
                    process.stderr.write( `/!\\ WARNING: ${message}\n` )
                }
            },
            cache:  undefined,

            // danger zone
            acorn:         undefined,
            context:       undefined,
            moduleContext: {}
        },
        outputOptions: {
            // core options
            file:    outputFilePath,
            format:  format,
            name:    'Itee.Database',
            globals: {},

            // advanced options
            paths:     {},
            banner:    '',
            footer:    '',
            intro:     '',
            outro:     '',
            sourcemap: _wantSourceMap,
            interop:   true,

            // danger zone
            exports: 'auto',
            amd:     {},
            indent:  '  ',
            strict:  true
        }

    }

}

module.exports = CreateRollupConfiguration
