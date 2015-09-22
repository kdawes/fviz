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

    if (raw[i] === 0xff) {
      blocks.push({
        'raw': raw[i],
        'rgba': { 'r': 255, 'g': 0, 'b': 0, 'a': 255 },
        'x': xx,
        'y': yy
      })
    } else if (raw[i] === 0x0) {
      blocks.push({
        'raw': raw[i],
        'rgba': { 'r': 0, 'g': 255, 'b': 0, 'a': 255 },
        'x': xx,
        'y': yy
      })
    } else if (re.test(raw[i])) {
      blocks.push({
        'raw': raw[i],
        'rgba': { 'r': 0, 'g': 0, 'b': 255, 'a': 255 },
        'x': xx,
        'y': yy
      })
    } else {
      blocks.push({
        'raw': raw[i],
        'rgba': { 'r': 255, 'g': 255, 'b': 255, 'a': 255 },
        'x': xx,
        'y': yy
      })
    }
  }
  return blocks
}

exports = module.exports = PluginFilterByType
