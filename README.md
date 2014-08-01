dirtmpl
===========

directory generator at the template.

[![Build Status](https://travis-ci.org/kumatch/dirtmpl.png?branch=master)](https://travis-ci.org/kumatch/dirtmpl)


Install
--------

    $ npm install -g dirtmpl


Example
--------

First, add templates by the directory with the name.

```
$ dirtmpl add mydir /path/to/mydir
```

Then build a target directory by template.

```
$ dirtmpl build mydir /path/to/new_directory
```

CLI commands
-------

### dirtmpl add <name> <directory>

Store the directory templates at <directory> with the name <name>.

### dirtmpl build <name> <directory>

Generate a directory at <name> template.

### dirtmpl list

List the templates in the registry.

### dirtmpl remove <name>

Remove the directory template <name> from the registry.




License
--------

Licensed under the MIT License.

Copyright (c) 2014 Yosuke Kumakura

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
