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
