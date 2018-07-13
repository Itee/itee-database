# <center>[Itee Database]</center>

The itee database contain all abstract class to manage database middleware and database plugins for itee server.


## How to install

From npm:

    npm install itee-database

If you want to build the repository from source follow these instructions:

    git clone https://github.com/Itee/itee-database.git
    npm install
    npm run build
        
## How to use

First of all, you should take a look to the documentation ! In case you have clone the repository you could auto-generate the library documentation using: 

    npm run doc

then you will be able to use like this:

    import { TAbstractDatabase } from 'itee-database'
    
    class MyAwesomeDatabase extend TAbstractDatabase {
        //...
    }

## Release notes

#### v1.0.0

* Add globals abstract class about database


## License (MIT)

**Copyright (c) 2015-Present, Itee, Valcke Tristan [https://github.com/Itee](https://github.com/Itee). All rights reserved.**

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
