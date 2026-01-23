import { createRollupConfigs } from '@itee/tasks/sources/utils/builds.mjs'

export default createRollupConfigs( {
    formats:     [ 'esm', 'cjs' ],
    externalMap: {
        'esm': [
            'node:path',
            'node:buffer',
            'node:fs',
            'node:stream',
            'crypto',

            'itee-validators',
            'itee-utils',
            'itee-core'
        ],
        'cjs': [
            'node:path',
            'node:buffer',
            'node:fs',
            'node:stream',
            'crypto',

            'itee-validators',
            'itee-utils',
            'itee-core'
        ],
    }
} )
