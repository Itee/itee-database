/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 */

/* global describe */

import { _fooUnits }   from './foo/foo.units'

const root = typeof window !== 'undefined' ? window :
    typeof global !== 'undefined' ? global :
        Function( 'return this' )()

describe( 'Itee#Units', () => {

    _fooUnits.call( root )

} )
