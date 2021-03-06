## fviz  - Provide three rough file view modes :
+ filtered by type [ascii,null,else]
+ raw
+ entropy

Basically, this started as experiments with browser bundling / module options, ~~webworkers~~, ~~grunt~~, browserify, live editing via beefy (<a href="https://github.com/chrisdickinson/beefy"> beefy </a> ), isomorphic router ( <a href="https://github.com/flatiron/director">flatiron/director</a> )
* ~~webworkers abandoned~~
* ~~grunt abandoned~~

Notes : I have browserify / beefy in the path, which allows this to work
+ $ npm install && npm start

# Live edits :
$ beefy js/go.js:js/browserifybundle.js --live

# Debugging :
Sometimes it's useful to run the browserify transforms by hand

$ browserify -t browserify-css -t reactify  js/go.js

# Point browser to :
http://localhost:9966/#/

## Eventually :
+ for bigger files, shard out the work across worker nodes and recombine
* do all the work / pregen on the serverside

[![js-standard-style](https://cdn.rawgit.com/feross/standard/master/badge.svg)](https://github.com/feross/standard)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
Â
