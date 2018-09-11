/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 * @file Todo
 *
 * @example Todo
 *
 */

class TAbstractDatabasePlugin {

    constructor () {}

    registerTo ( driver, application, router ) {

        console.error('TAbstractDatabasePlugin: Need to reimplement registerTo method !')

    }

}

module.exports = TAbstractDatabasePlugin
