import { glob } from 'glob'
import {
    basename,
    join,
    normalize
}           from 'path'
import {
    packageName,
    packageSourcesDirectory
}           from '../_utils.mjs'


const filePathsToIgnore = [
    `${ packageName }.js`
]

const sourcesFiles = glob.sync( join( packageSourcesDirectory, '**' ) )
                         .map( filePath => normalize( filePath ) )
                         .filter( filePath => {
                             const fileName         = basename( filePath )
                             const isJsFile         = fileName.endsWith( '.js' )
                             const isNotPrivateFile = !fileName.startsWith( '_' )
                             const isNotIgnoredFile = !filePathsToIgnore.includes( fileName )
                             return isJsFile && isNotPrivateFile && isNotIgnoredFile
                         } )

export { sourcesFiles }
