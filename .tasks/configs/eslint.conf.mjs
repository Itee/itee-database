import js      from '@eslint/js'
import mocha   from 'eslint-plugin-mocha'
import {
    defineConfig,
    globalIgnores
}              from 'eslint/config'
import globals from 'globals'


export default defineConfig( [
    globalIgnores( [
        '.github',
        '.idea',
        'builds',
        'docs'
    ] ),
    {
        linterOptions: {
            noInlineConfig:                false,
            reportUnusedDisableDirectives: 'error',
            reportUnusedInlineConfigs:     'error'
        }
    },
    {
        name:            'sources/common',
        files:           [ 'sources/**/*.js' ],
        plugins:         { js },
        extends:         [ 'js/recommended' ],
        languageOptions: { globals: globals.node },
        rules:           {
            'no-multiple-empty-lines':  [
                'error',
                {
                    'max': 2
                }
            ],
            'no-mixed-spaces-and-tabs': 'error',
            'no-console':               'warn',
            'no-unused-vars':           'error',
            'no-multi-spaces':          [
                'error',
                {
                    'exceptions': {
                        'Property':             true,
                        'ImportDeclaration':    true,
                        'VariableDeclarator':   true,
                        'AssignmentExpression': true
                    }
                }
            ],
            'key-spacing':              [
                'error',
                {
                    'align': {
                        'beforeColon': false,
                        'afterColon':  true,
                        'on':          'value'
                    }
                }
            ]
        }
    },
    {
        name:    'tests/benchmarks',
        files:   [ 'tests/benchmarks/**/*.js' ],
        ignores: [ 'tests/benchmarks/builds/*' ],
        plugins: { js },
        extends: [ 'js/recommended' ],
    },
    {
        name:            'tests/units',
        files:           [ 'tests/units/**/*.js' ],
        ignores:         [ 'tests/units/builds/*' ],
        plugins:         { js },
        extends:         [ 'js/recommended' ],
        languageOptions: {
            globals: {
                global: 'readonly',
                window: 'readonly',
            },
        }
    },
    {
        files:   [ 'tests/units/**/*.js' ],
        ignores: [ 'tests/units/builds/*' ],
        ...mocha.configs.all
    },
] )
