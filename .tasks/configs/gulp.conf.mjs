import { readFileSync }  from 'fs'
import {
    dirname,
    join
}                        from 'path'
import { fileURLToPath } from 'url'


const packageInfos = JSON.parse( readFileSync(
    new URL( '../package.json', import.meta.url )
) )
const __filename   = fileURLToPath( import.meta.url )
const __dirname    = dirname( __filename )

const config = {
    'clean':              [
        './builds',
        './tests/units',
        './tests/benchmarks',
        './tests/bundles',
        './docs'
    ],
    'lint':               [
        'configs/**/*.js',
        'sources/**/*.js',
        'tests/**/*.js',
        '!tests/bundles/**/*.js',
        '!tests/**/builds/*.js'
    ],
    'doc':                [
        'README.md',
        'gulpfile.mjs',
        './configs/*.js',
        './sources/**/*.js',
        './tests/**/*.js'
    ],
    'check-bundling':     [
        `${ packageInfos.name }.js`,
        'LineFileSplitter.js'
    ],
    'compute-unit-tests': [
        `${ packageInfos.name }.js`,
        'isTestUnitGenerator.js',
        'cores.js'
    ],
    'compute-benchmarks': [
        `${ packageInfos.name }.js`,
        'isTestUnitGenerator.js',
        'cores.js'
    ],
    'builds':             {
        input:     join( __dirname, '../sources', `${ packageInfos.name }.js` ),
        output:    join( __dirname, '../builds' ),
        formats:   [ 'esm', 'cjs' ],
        envs:      [ 'dev', 'prod' ],
        sourcemap: true,
        treeshake: true
    }
}

function getGulpConfigForTask( taskName ) {

    return config[ taskName ]

}

export { getGulpConfigForTask }