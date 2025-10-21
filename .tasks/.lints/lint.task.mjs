import { lintConf as filesToLint } from '../configs/lint.conf.mjs'
import gulp                        from 'gulp'
import eslint                      from 'gulp-eslint'
import log                         from 'fancy-log'

function lintTask( done ) {

    for ( let fileIndex = 0, numberOfFiles = filesToLint.length ; fileIndex < numberOfFiles ; fileIndex++ ) {
        log( `[${ fileIndex + 1 }/${ numberOfFiles }] Lint ${ filesToLint[ fileIndex ] }` )
    }

    return gulp.src( filesToLint, { base: './' } )
               .pipe( eslint( {
                   allowInlineConfig: true,
                   globals:           [],
                   fix:               true,
                   quiet:             false,
                   envs:              [],
                   configFile:        './.tasks/configs/eslint.conf.json',
                   parserOptions:     {},
                   plugins:           [],
                   rules:             {},
                   useEslintrc:       false
               } ) )
               .pipe( eslint.format( 'stylish' ) )
               .pipe( gulp.dest( '.' ) )
               .pipe( eslint.failAfterError() )

}

export { lintTask }