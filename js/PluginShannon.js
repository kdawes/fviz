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
        'r': tmp[i] * 1.095,
        'g': 0,
        'b': 0,
        'a': tmp[i] << 4
      },
      'x': xx,
      'y': yy
    })
  }
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
  var sz = 64

  var raw = opts.data
  var left = raw.length
  var idx = 0
  var count = 0
  var chunk_size = (undefined === sz) ? 20 : sz

  do {
    var sums = 0
    var n = (left >= chunk_size) ? chunk_size : left
    var chunk = raw.subarray(idx, idx + n)
    var hist = u.historize(chunk)
    Object.keys(hist).forEach(function (k) {
      var p = hist[k] / chunk.length
      sums += p * u.log2(p)
    })
    //	console.log (count + ' : ' + -1 * sums)
    r.push(-idx * sums)
    left -= n
    idx += n
    count++
  } while (left > 0)
  return r
}

exports = module.exports = PluginShannon
