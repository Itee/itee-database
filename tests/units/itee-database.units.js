import { describe }      from 'mocha'

const root = typeof window === 'undefined'
    ? typeof global === 'undefined'
        ? Function( 'return this' )() 
        : global 
    : window

describe( 'Itee#Validators', () => {


} )
