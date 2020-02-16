/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 */

/* global describe */

import { isBarUnits }    from './bar/isBar.units'

function _fooUnits () {

    describe( 'Foo', () => {

        isBarUnits.call( this )

    } )

}

export { _fooUnits }
