var Util = require('./Utils') // my junk
var u = new Util()
var log = console.log.bind(console, 'DBG>')

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
    blocks.push({
      'raw': tmp[i],
      'rgba': {
        'r': tmp[i],
        'g': 0,
        'b': 0,
        'a': tmp[i]
      },
      'x': xx,
      'y': yy
    })
  }
  //log('BLOCKS', JSON.stringify(blocks,null,1))
  return blocks
}

// //shannon: function (bytes) {
// // var sums = 0
// // Object.keys(bytes).forEach(function (k) {
// //   var p = pct(k); sums += p * log2(p)
// // })
// // console.log('Shannon entropy ' + -1 * sums)
// //},
function chunked_shannon (opts) {
  log('ChunkedSHannon')
  var r = []
  // XXX fixme - should come from opts
  var sz = 32

  var raw = opts.data
  var left = raw.length
  var idx = 0
  var count = 0
  var chunk_size = (undefined === sz) ? 20 : sz
  var hist = u.historize(raw)
  var len = Object.keys(hist).length
  do {
    var sums = 0
    var n = (left >= chunk_size) ? chunk_size : left
    var chunk = raw.subarray(idx, idx + n)
    chunk.forEach(function (k) {
      var p = hist[k] / len
      sums += p * u.log2(p)
    })
    //	console.log (count + ' : ' + -1 * sums)
    var tt = Math.abs(-idx * sums)
    var normalized = u.normalize([tt])[0]
    r.push(normalized)
    left -= 1
    idx += 1
    count++
  } while (left > 0)
  return r
}

exports = module.exports = PluginShannon
