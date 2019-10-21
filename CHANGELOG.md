## [7.3.2](https://github.com/Itee/itee-database/compare/v7.3.1...v7.3.2) (2019-10-21)


### Bug Fixes

* **tabstractconvertermanager:** fix missing return statement on next usage ([79844c0](https://github.com/Itee/itee-database/commit/79844c0))

## [7.3.1](https://github.com/Itee/itee-database/compare/v7.3.0...v7.3.1) (2019-09-26)


### Bug Fixes

* **package:** update packages and fix version ([92640a5](https://github.com/Itee/itee-database/commit/92640a5))

# [7.3.0](https://github.com/Itee/itee-database/compare/v7.2.2...v7.3.0) (2019-08-14)


### Bug Fixes

* **tabstractconvertermanager:** fix hard return on already processed files, and better file check ([923c7ef](https://github.com/Itee/itee-database/commit/923c7ef))
* **tabstractconvertmanager:** fix inserter ctor parameters ([9c6ecea](https://github.com/Itee/itee-database/commit/9c6ecea))
* **tabstractfileconverter:** fix wrong variable name in queue processing as dump type ([1a1248f](https://github.com/Itee/itee-database/commit/1a1248f))
* **tmongodbplugin:** change shema registration order. check before registerModelTo and then function ([2161b43](https://github.com/Itee/itee-database/commit/2161b43))


### Features

* **tabstractfileconvertor:** allow to load files from string, url OR directly from memory ([2675add](https://github.com/Itee/itee-database/commit/2675add))

## [7.2.2](https://github.com/Itee/itee-database/compare/v7.2.1...v7.2.2) (2019-08-13)


### Bug Fixes

* **tmongodbplugin:** add missing return this in addSchema method ([bf3e9be](https://github.com/Itee/itee-database/commit/bf3e9be))

## [7.2.1](https://github.com/Itee/itee-database/compare/v7.2.0...v7.2.1) (2019-08-13)


### Bug Fixes

* **tmongodbplugin:** fix schema registration using different registration possibilities ([57151b6](https://github.com/Itee/itee-database/commit/57151b6))

# [7.2.0](https://github.com/Itee/itee-database/compare/v7.1.1...v7.2.0) (2019-08-13)


### Features

* **tmongodbplugin:** add schema registration ([cc1b772](https://github.com/Itee/itee-database/commit/cc1b772))

## [7.1.1](https://github.com/Itee/itee-database/compare/v7.1.0...v7.1.1) (2019-08-13)


### Bug Fixes

* **tabstractdatabase:** remove extra argument in registerLocalPlugin that collide with path module ([0511264](https://github.com/Itee/itee-database/commit/0511264))

# [7.1.0](https://github.com/Itee/itee-database/compare/v7.0.1...v7.1.0) (2019-08-12)


### Bug Fixes

* **tabstractdatabase:** fix registerPlugins methods forof loop ([2e210a3](https://github.com/Itee/itee-database/commit/2e210a3))
* **tabstractdatabaseplugin:** update controller ctor call and parameters ([5b24e7b](https://github.com/Itee/itee-database/commit/5b24e7b))


### Features

* **docs:** add docs to github ([1882ac1](https://github.com/Itee/itee-database/commit/1882ac1))
* **tmongodbplugin:** allow to register type from code ([479898c](https://github.com/Itee/itee-database/commit/479898c))

## [7.0.1](https://github.com/Itee/itee-database/compare/v7.0.0...v7.0.1) (2019-08-04)


### Bug Fixes

* **package:** add postversion script to build with latest package version ([7250a2f](https://github.com/Itee/itee-database/commit/7250a2f))

# [7.0.0](https://github.com/Itee/itee-database/compare/v6.0.0...v7.0.0) (2019-08-04)


### Code Refactoring

* **rollupconfig:** update external package to avoid big bundle. Remove unecessary rollup plugin ([e320cb0](https://github.com/Itee/itee-database/commit/e320cb0))


### BREAKING CHANGES

* **rollupconfig:** Database are no longer packaged with bundle

# [6.0.0](https://github.com/Itee/itee-database/compare/v5.2.6...v6.0.0) (2019-08-03)


### Bug Fixes

* **gulpfile:** fix default name for umd module on bundling ([b2bc5b4](https://github.com/Itee/itee-database/commit/b2bc5b4))
* **readme:** fix travis url ([1ff3cbe](https://github.com/Itee/itee-database/commit/1ff3cbe))
* **tabstractconvertermanager:** fix wrong classname to call static method ([050ac4e](https://github.com/Itee/itee-database/commit/050ac4e))
* **tabstractdatabase:** fix missings imports from itee-validators ([bfce080](https://github.com/Itee/itee-database/commit/bfce080))
* **tabstractdatabaseplugin:** fix missings imports from ite-validators ([d916c8a](https://github.com/Itee/itee-database/commit/d916c8a))
* **tmongodbplugin:** fix bad package for some validation function ([ab0b5ba](https://github.com/Itee/itee-database/commit/ab0b5ba))
* **tpostgressqlcontroller:** fix wrong variable name ([b1179be](https://github.com/Itee/itee-database/commit/b1179be))
* **tpostgressqldatabase:** fix wrong duplicate variable declaration ([d4c8278](https://github.com/Itee/itee-database/commit/d4c8278))
* **tpostgressqldatabase:** fix wrong import usage for pg-promise ([e16ca69](https://github.com/Itee/itee-database/commit/e16ca69))
* **travis:** fix env variable declaration ([2e00771](https://github.com/Itee/itee-database/commit/2e00771))
* **travis:** fix missing patch script call in travis deployment ([dac3ea9](https://github.com/Itee/itee-database/commit/dac3ea9))


### chore

* **release:** builds ([b8ca248](https://github.com/Itee/itee-database/commit/b8ca248))


### BREAKING CHANGES

* **release:** use bundle instead of main entry point
