function PluginRaw () {
  if (!(this instanceof PluginRaw)) {
    return new PluginRaw()
  }
  this.run = run
}

// required
// opts.data data array to be analyzed
// opts.bw block width
// opts.bh block height
// opts.spanw length of an x-run
function run (opts) {
  if (!opts.data) {
    throw new Error('PluginRaw:Run: missing opts.data')
  }
  var blocks = []
  var raw = opts.data
  for (var i = 0; i < raw.length; i++) {
    var y = Math.floor(i * opts.bw / opts.spanw)
    var xx = (i * opts.bw) % opts.spanw
    var yy = (y * opts.bh)
    blocks.push({
      'raw': raw[i],
      'rgba': { 'r': 0, 'g': 0, 'b': raw[i], 'a': raw[i] },
      'x': xx,
      'y': yy
    })
  }
  return blocks
}

exports = module.exports = PluginRaw