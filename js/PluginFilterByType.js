var log = console.log.bind(console, 'DBG>')

function PluginFilterByType () {
  if (!(this instanceof PluginFilterByType)) {
    return new PluginFilterByType()
  }
  this.run = run
}

function run (opts) {
  log('PLUGINFILTER')
  var blocks = []
  var raw = opts.data
  var re = /[\x20-\x7E]/
  for (var i = 0; i < raw.length; i++) {
    var y = Math.floor(i * opts.bw / opts.spanw)
    var xx = (i * opts.bw) % opts.spanw
    var yy = (y * opts.bh)
    var r = 0
    var g = 0
    var b = 0
    var a = 255
    if (raw[i] === 0xff) {
      r = 255
    } else if (raw[i] === 0x0) {
      g = 255
    } else if (re.test(raw[i])) {
      b = 255
    } else {
      r = 255
      g = 255
      b = 255
      a = 255
    }
    blocks.push({
      'raw': raw[i],
      'rgba': { 'r': r, 'g': g, 'b': b, 'a': a },
      'x': xx,
      'y': yy
    })
  }
  return blocks
}

exports = module.exports = PluginFilterByType
