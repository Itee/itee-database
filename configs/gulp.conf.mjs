import { readFileSync } from 'fs'

const packageInfos = JSON.parse( readFileSync(
    new URL( '../package.json', import.meta.url )
) )

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
    ]
}

function getGulpConfigForTask( taskName ) {

    return config[ taskName ]

}

export { getGulpConfigForTask }