'use strict'
var Utils = require('./Utils') // my junk
var log = console.log.bind(console, 'DBG>')
var React = require('react')
var Chunk = require('./components/Chunk')

function PluginShannon () {
  if (!(this instanceof PluginShannon)) {
    return new PluginShannon()
  }
  this.run = run
}

// required
// opts.data data array to be analyzed
// opts.bw block width
// opts.bh block height
// opts.spanw length of an x-run
function run (opts) {
  var blocks = []
  var tmp = chunked_shannon(opts)
  for (var i = 0; i < tmp.length; i++) {
    var y = Math.floor(i * opts.bw / opts.spanw)
    var xx = (i * opts.bw) % opts.spanw
    var yy = (y * opts.bh)

    var rgba = { 'r': tmp[i], 'g': 0, 'b': 0, 'a': tmp[i]}
    blocks.push(<Chunk  key={i} x={xx} y={yy} rgba={rgba} w={opts.bw} h={opts.bh}/>)
  }
  return blocks
}

function chunked_shannon (opts) {
  log('ChunkedSHannon')
  var r = []
  // XXX fixme - should come from opts
  var sz = 32

  var raw = opts.data
  var left = raw.length
  var idx = 0
  var chunk_size = (undefined === sz) ? 20 : sz

  do {
    var sums = 0
    var n = (left >= chunk_size) ? chunk_size : left
    var chunk = raw.subarray(idx, idx + n)
    var hist = Utils.historize(chunk)
    var len = Object.keys(hist).length
    chunk.forEach(function (k) {
      var p = hist[k] / len
      sums += p * Utils.log2(p)
    })
    var normalized = Utils.normalize([Math.abs(-idx * sums)])[0]
    r.push(normalized)
    idx += 1
  } while (--left > 0)
    return r
  }

  exports = module.exports = PluginShannon
