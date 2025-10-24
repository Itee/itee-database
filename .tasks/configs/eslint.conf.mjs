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
        'docs',
        'sources/scripts/*.js'
    ] ),
    {
        linterOptions: {
            noInlineConfig:                false,
            reportUnusedDisableDirectives: 'error',
            reportUnusedInlineConfigs:     'error'
        }
    },
    {
        name:    'sources/common',
        files:   [ 'sources/**/*.js' ],
        plugins: { js },
        extends: [ 'js/recommended' ],
        rules:   {
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
        name:  'sources/expected_rules',
        files: [ 'sources/cores/strings.js' ],
        rules: {
            'no-control-regex': 'off'
        }
    },
    {
        name:            'sources/frontend',
        files:           [
            'sources/times/*.js',
            'sources/cores/objects.js',
            'sources/testings/benchmarks.js',
        ],
        ignores:         [ 'sources/file-system/*' ],
        plugins:         { js },
        extends:         [ 'js/recommended' ],
        languageOptions: { globals: globals.browser }
    },
    {
        name:            'sources/backend',
        files:           [ 'sources/file-system/*.js' ],
        ignores:         [
            'sources/times/*.js',
            'sources/cores/objects.js',
            'sources/testings/benchmarks.js',
        ],
        plugins:         { js },
        extends:         [ 'js/recommended' ],
        languageOptions: { globals: globals.node }
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
    // Todo: fix
    {
        name:  'to/fix',
        files: [ 'tests/units/cores/strings.unit.js' ],
        rules: {
            'no-unused-vars': 'warn',
        }
    },
] )
