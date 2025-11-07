import { playwrightLauncher }   from '@web/test-runner-playwright'
import { packageRootDirectory } from '../_utils.mjs'
import { iteeReporter }         from '../itee-reporter.mjs'

export default {
    files:          [
        'tests/benchmarks/**/*.bench.js',
        '!tests/benchmarks/builds/**'
    ],
    debug:          false,
    nodeResolve:    true,
    browsers:       [
        playwrightLauncher( { product: 'chromium' } ),
        playwrightLauncher( { product: 'webkit' } ),
        playwrightLauncher( { product: 'firefox' } ),
    ],
    testFramework:  {
        path:   packageRootDirectory + '/.tasks/itee-benchmarks-framework.js',
        config: {
            foo: 'bar'
        }
    },
    testRunnerHtml: testFramework => `
        <!DOCTYPE html>
        <html>
          <body>
            <script type="module" src="node_modules/lodash/lodash.js"></script>
            <script type="module" src="node_modules/platform/platform.js"></script>
            <script type="module" src="node_modules/benchmark/benchmark.js"></script>
            <script type="module" src="${ testFramework }"></script>
          </body>
        </html>
    `,
    reporters:      [
        iteeReporter( {
            reportProgress: true
        } )
    ]
}