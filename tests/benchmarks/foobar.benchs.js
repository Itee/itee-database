/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 */

/* global suite, benchmark */

export default suite( 'Itee#FooBar', () => {

    benchmark(
        'isFastFoo()',
        function () {

            return true

        },
        {} )

    benchmark(
        'isFastBar()',
        function () {

            return true

        },
        {} )

} )
