import {
    Configurator,
    MochaRecommendedRulesSet,
    SourceRulesSet,
    TestBenchmarksRulesSet,
    TestUnitsRulesSet
} from '@itee/tasks/sources/lints/lint.conf.mjs'

SourceRulesSet.rules[ 'no-console' ] = 'warn'

Configurator.rulesSets = [
    SourceRulesSet,
    TestBenchmarksRulesSet,
    TestUnitsRulesSet,
    MochaRecommendedRulesSet
]

export default Configurator.getConfig()
