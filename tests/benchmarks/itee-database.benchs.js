/**
 * @author [Tristan Valcke]{@link https://github.com/Itee}
 * @license [BSD-3-Clause]{@link https://opensource.org/licenses/BSD-3-Clause}
 *
 */

/* global suite, benchmark */

const IteeDatabaseSuite = suite( 'Itee#Database', () => {

    benchmark(
        'isArray()',
        function () {

            return true

        },
        {} )

} )

export { IteeDatabaseSuite }
