/**
 * @method npm run patch
 * @global
 * @description Will apply some patch/replacements in dependencies
 */
const patchTask       = ( done ) => {
    done()
}
patchTask.displayName = 'patch'
patchTask.description = 'Will apply some patch/replacements in dependencies'
patchTask.flags       = null

export { patchTask }