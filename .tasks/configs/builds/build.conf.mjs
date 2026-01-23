import { createRollupConfigs } from '@itee/tasks/sources/utils/builds.mjs'

export default createRollupConfigs( {
    formats:     [ 'esm', 'cjs' ],
    externalMap: {
        'esm': [
            'path',
            'buffer',
            'fs',
            'stream',
            'crypto',

            'itee-validators',
            'itee-utils',
            'itee-core'
        ],
        'cjs': [
            'path',
            'buffer',
            'fs',
            'stream',
            'crypto',

            'itee-validators',
            'itee-utils',
            'itee-core'
        ],
    }
} )
