
<h1 align="center">[Itee Database]</h1>
<br>

<p align="center">The itee database contain all abstract class to manage database middleware and database plugins for itee server.</p>
<br>

<p align="center">
    <a href="https://www.npmjs.com/package/itee-database" target="_blank" rel="noopener noreferrer">
        <img src="https://img.shields.io/npm/v/itee-database" alt="Current package version">
    </a>
    <a href="https://github.com/Itee/itee-database" target="_blank" rel="noopener noreferrer">
        <img src="https://github.com/Itee/itee-database/actions/workflows/node.js.yml/badge.svg" alt="Itee-Database CI">
    </a>
    <a href="https://github.com/semantic-release/semantic-release" target="_blank" rel="noopener noreferrer">
        <img src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg" alt="Build status">
    </a>
</p>

<br>
<h2>How to install</h2>

From npm:

    npm install itee-database

If you want to build the repository from source follow these instructions:

    git clone https://github.com/Itee/itee-database.git
    npm install
    npm run build
     
<br>   
<h2>How to use</h2>

<p align="center">At begin was <a href="https://itee.github.io/itee-database/">RTFM</a> !</p>
<br>
In case you have clone the repository you could also auto-generate the library documentation using: 

    npm run doc

then you will be able to use like this:

    import { TAbstractDatabase } from 'itee-database'
    
    class MyAwesomeDatabase extend TAbstractDatabase {
        //...
    }
    
    export { MyAwesomeDatabase }

<br>
<h2>License (BSD-3-Clause)</h2>

**Copyright (c) 2015-Present, Itee, Valcke Tristan [https://github.com/Itee](https://github.com/Itee). All rights reserved.**

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
- Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
- Neither the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

You should have received a copy of the [BSD-3-Clause](https://opensource.org/licenses/BSD-3-Clause) along 
with this program.  If not, see [https://opensource.org/licenses/BSD-3-Clause](https://opensource.org/licenses/BSD-3-Clause).
