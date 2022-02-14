## [8.1.4](https://github.com/Itee/itee-database/compare/v8.1.3...v8.1.4) (2022-02-14)


### Bug Fixes

* **package:** apply npm audit fix ([75a471e](https://github.com/Itee/itee-database/commit/75a471e4bb55b5a03416735881d578c5896b65df))
* **package:** update deps to latest version ([e7751da](https://github.com/Itee/itee-database/commit/e7751da078c39bc06a757d757733c3021c4e8719))

## [8.1.3](https://github.com/Itee/itee-database/compare/v8.1.2...v8.1.3) (2021-07-21)


### Bug Fixes

* **readme:** fix readme tags ([ac4a9be](https://github.com/Itee/itee-database/commit/ac4a9be00279310bcebb38fa414478e390921aca))

## [8.1.2](https://github.com/Itee/itee-database/compare/v8.1.1...v8.1.2) (2021-07-08)


### Bug Fixes

* **package:** apply dependencies fix ([904105a](https://github.com/Itee/itee-database/commit/904105acdfba91455ce6e2aef2c0a8ce6366ad91))
* **package:** apply fix from dependencies ([ffaaca8](https://github.com/Itee/itee-database/commit/ffaaca8c1abdc73e39c32b683b0d6e4c69e1952a))
* **releaserc:** fix missing dev maps ([3e34131](https://github.com/Itee/itee-database/commit/3e341315a747c1a447431f9b8469ecdb15816d67))
* **tabstractadatabaseplugin:** fix logger usage over static methods ([f315d23](https://github.com/Itee/itee-database/commit/f315d23777a3d773241a60fe9fa53e2340031f9c))
* **tabstractdatabase:** fix plugin setter and plugin config usage ([b11ecf6](https://github.com/Itee/itee-database/commit/b11ecf6465085a05fe110fd06542650c21780a0a))
* **tabstractdatabase:** remove unused import ([b55b778](https://github.com/Itee/itee-database/commit/b55b778f1ac20b112b5a7372dd0b1612e36f8536))
* **tabstractdatacontroller:** fix transfert parameter to super class ([b3fcb95](https://github.com/Itee/itee-database/commit/b3fcb9585f13056c1da7aca9461247badded5434))

## [8.1.1](https://github.com/Itee/itee-database/compare/v8.1.0...v8.1.1) (2021-07-05)


### Bug Fixes

* **package:** update all dependencies to their latest version ([ea35523](https://github.com/Itee/itee-database/commit/ea3552387bed4b6d14830be2f7d5ec480bba8190))

# [8.1.0](https://github.com/Itee/itee-database/compare/v8.0.2...v8.1.0) (2021-07-02)


### Bug Fixes

* **abstractdatacontroller:** fix parameter that should not be optional ([66d2949](https://github.com/Itee/itee-database/commit/66d29495270ccd458047769bd2313e2c88e93c6f))
* **badmappingerror:** fix wrong import path ([69f05e4](https://github.com/Itee/itee-database/commit/69f05e4b31644a74ffa555d4ba44f3f66893d36f))
* **global:** extends class with tabstractobject and fix all console statement ([8551dbd](https://github.com/Itee/itee-database/commit/8551dbdf10a0e4e559523450945611c7af0ecbe8))
* **package:** apply npm audit fix ([3c2ee41](https://github.com/Itee/itee-database/commit/3c2ee4132b9fa841a6537d584b090bc8e6c0618a))
* **package:** fix itee-utils and itee-validator peer dependency usage ([fca0d3a](https://github.com/Itee/itee-database/commit/fca0d3ac3a201f6ed636322b01ffd0de2288800e))


### Features

* **httperrors:** add support for http errors 4xx and 5xx ([73fee38](https://github.com/Itee/itee-database/commit/73fee384dc7c127d9b841d699105d5e7232d0167))
* **iteedatabase:** export global Databases map to allow auto registration and use it as factory ([7c7cf5e](https://github.com/Itee/itee-database/commit/7c7cf5e99b5ba12fa225e0bf059ac4bc795b6570))
* **tabstractdatabase:** extend tabstractdatabase with tabstractobject and allow to use logger ([16115d9](https://github.com/Itee/itee-database/commit/16115d92512a9b39f41f1447cf6ffdcad8cafe11))

## [8.0.2](https://github.com/Itee/itee-database/compare/v8.0.1...v8.0.2) (2020-02-17)


### Bug Fixes

* **package:** update package lock ([996460e](https://github.com/Itee/itee-database/commit/996460e7e863d2c5971efbc5be914874999a1c99)), closes [#7](https://github.com/Itee/itee-database/issues/7)

## [8.0.1](https://github.com/Itee/itee-database/compare/v8.0.0...v8.0.1) (2020-02-17)


### Bug Fixes

* **tabstractfileconverter:** remove useless console warn to avoid eslint warning ([21c1bfa](https://github.com/Itee/itee-database/commit/21c1bfaba9b52d98bf8f1a88ae9e0acad780c445))

# [8.0.0](https://github.com/Itee/itee-database/compare/v7.3.2...v8.0.0) (2020-02-16)


### Code Refactoring

* **global:** break this package into sub-package to avoid to install all databases ([568eff3](https://github.com/Itee/itee-database/commit/568eff3c70326aec4b7d9b83bf2ce83239da20ec))


### BREAKING CHANGES

* **global:** All databases are in their own package, and no longer available in this one.

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
