import colors from 'ansi-colors'
import log    from 'fancy-log'
import {
    getPrettyNodeVersion,
    getPrettyNpmVersion,
    getPrettyPackageName,
    getPrettyPackageVersion,
    Indenter
}             from '../_utils.mjs'

const {
          red,
          green,
          blue,
          cyan,
          yellow,
          magenta,
          unstyle
      } = colors

function alignTextCenter( text, width ) {

    const unstyledText = unstyle( text.repeat( 1 ) )
    const marginLength = ( width - unstyledText.length ) / 2

    let leftMargin, rightMargin
    if ( Number.isInteger( marginLength ) ) {
        leftMargin  = marginLength
        rightMargin = marginLength
    } else {
        const flooredMargin = Math.floor( marginLength )
        leftMargin          = flooredMargin
        rightMargin         = flooredMargin + 1
    }

    return ' '.repeat( leftMargin ) + text + ' '.repeat( rightMargin )

}

function alignTextLeft( text, width ) {

    const unstyledText = unstyle( text.repeat( 1 ) )
    let repeatTime     = width - unstyledText.length
    repeatTime         = ( repeatTime > 0 ) ? repeatTime : 0

    return text + ' '.repeat( repeatTime )

}

function alignTextRight( text, width ) {

    const unstyledText = unstyle( text.repeat( 1 ) )
    let repeatTime     = width - unstyledText.length
    repeatTime         = ( repeatTime > 0 ) ? repeatTime : 0

    return ' '.repeat( repeatTime ) + text

}

/**
 * @method npm run help ( default )
 * @global
 * @description Will display the help in console
 */
const helpTask       = ( done ) => {

    const bannerWidth          = 70
    const prettyPackageName    = getPrettyPackageName()
    const prettyPackageVersion = getPrettyPackageVersion()
    const prettyNodeVersion    = getPrettyNodeVersion()
    const prettyNpmVersion     = getPrettyNpmVersion()

    const tableCharset = {
        topLeftCorner:       '┏',
        topRightCorner:      '┓',
        bottomRightCorner:   '┛',
        bottomLeftCorner:    '┗',
        horizontalBorder:    '━',
        horizontalSeparator: '─',
        leftJoinSeparator:   '┠',
        rightJoinSeparator:  '┨',
        verticalBorder:      '┃',
        verticalSeparator:   '',
    }

    const mainBorder     = tableCharset.horizontalBorder.repeat( bannerWidth )
    const thinBorder     = tableCharset.horizontalSeparator.repeat( bannerWidth )
    const tableTop       = `${ tableCharset.topLeftCorner }${ mainBorder }${ tableCharset.topRightCorner }`
    const tableSeparator = `${ tableCharset.leftJoinSeparator }${ thinBorder }${ tableCharset.rightJoinSeparator }`
    const tableBottom    = `${ tableCharset.bottomLeftCorner }${ mainBorder }${ tableCharset.bottomRightCorner }`
    const tableLine      = ( innerText ) => `${ tableCharset.verticalBorder }${ innerText }${ tableCharset.verticalBorder }`

    const {
              I_,
              I__,
              I___,
              I____,
          } = new Indenter( '\t', 4 )

    const npmRun = blue( 'npm run' )

    log( '' )
    log( tableTop )
    log( tableLine( alignTextCenter( 'HELP', bannerWidth ) ) )
    log( tableLine( alignTextCenter( prettyPackageName, bannerWidth ) ) )
    log( tableLine( alignTextCenter( prettyPackageVersion, bannerWidth ) ) )
    log( tableSeparator )
    log( tableLine( alignTextLeft( prettyNodeVersion, bannerWidth ) ) )
    log( tableLine( alignTextLeft( prettyNpmVersion, bannerWidth ) ) )
    log( tableBottom )
    log( I_, 'Available commands are:' )
    log( I__, npmRun, cyan( 'help' ), '- Display this help.' )
    log( I__, npmRun, cyan( 'patch' ), '- Will apply some patch/replacements in dependencies.', red( '(Apply only once after run "npm install")' ) )
    log( I__, npmRun, cyan( 'clean' ), '- Will delete builds and temporary folders.' )
    log( I__, npmRun, cyan( 'lint' ), '- Will run the eslint in pedantic mode with auto fix when possible.' )
    log( I__, npmRun, cyan( 'doc' ), '- Will run jsdoc, and create documentation under `documentation` folder, using the docdash theme' )
    log( I__, npmRun, cyan( 'test' ), '- Will run the test framworks (unit and bench), and create reports under `documentation/report` folder, using the mochawesome theme' )
    log( I__, npmRun, cyan( 'unit' ), '- Will run the karma server for unit tests.' )
    log( I__, npmRun, cyan( 'bench' ), '- Will run the karma server for benchmarks.' )
    log( I__, npmRun, cyan( 'build' ), yellow( '--' ), green( '<options>' ), '- Will build the application for development and/or production environments.' )
    log( I___, yellow( 'Note: The two dash are only required if you provide options !' ) )
    log( I___, 'The available', green( '<options>' ), 'are:' )
    log( I____, green( '-i' ), 'or', green( '--input' ), '- The main file path to build', cyan( '[Default: "sources/main.js"]' ), '.' )
    log( I____, green( '-o' ), 'or', green( '--output' ), '- The folder where output the build', cyan( '[Default: "builds"]' ), '.' )
    log(
        I____,
        green( '-f:' ),
        magenta( '<format>' ),
        'or',
        green( '--format:' ),
        magenta( '<format>' ),
        ' - to specify the output build type. Where format could be any of:', magenta( 'cjs, esm, iife, umd' ), '.'
    )
    log( I____, green( '-e:' ), magenta( '<env>' ), 'or', green( '--env:' ), magenta( '<env>' ), ' - to specify the build environment. Where env could be any of:', magenta(
        'dev' ), magenta( 'prod' ), cyan( '[Default: "dev"]' ), '.' )
    log( I____, green( '-s' ), 'or', green( '--sourcemap' ), ' - to build with related source map', cyan( '[Default: true]' ), '.' )
    log( I____, green( '-t' ), 'or', green( '--treeshake' ), ' - allow to perform treeshaking when building', cyan( '[Default: true]' ), '.' )
    log( I__, npmRun, cyan( 'release' ), '- Will run all the lint, test stuff, and if succeed will build the application.' )
    log( '' )
    log( I_, 'In case you have', blue( 'gulp' ), 'installed globally, you could use also:' )
    log( I__, blue( 'gulp' ), cyan( 'command' ), '- It will perform the command like using "npm run" but with less characters to type... Because you\'re a developer, right ?' )
    log( '' )

    done()

}
helpTask.displayName = 'help'
helpTask.description = 'Display the package help'
helpTask.flags       = null

export { helpTask }
