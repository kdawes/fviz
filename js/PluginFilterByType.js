var log = console.log.bind(console, 'DBG>')
var React = require('react')
var Chunk = require('./components/Chunk')

function PluginFilterByType () {
  if (!(this instanceof PluginFilterByType)) {
    return new PluginFilterByType()
  }
  this.run = run
}

function run (opts) {
  log('PLUGINFILTER')
  var blocks = []
  var re = /[\x20-\x7E]/
  for (var i = 0; i < opts.data.length; i++) {
    var y = Math.floor(i * opts.bw / opts.spanw)
    var xx = (i * opts.bw) % opts.spanw
    var yy = (y * opts.bh)
    var r = 0
    var g = 0
    var b = 0
    var a = 255
    if (opts.data[i] === 0xff) {
      r = 255
    } else if (opts.data[i] === 0x0) {
      g = 255
    } else if (re.test(opts.data[i])) {
      b = 255
    } else {
      r = 255
      g = 255
      b = 255
      a = 255
    }
    var rgba = { 'r': r, 'g': g, 'b': b, 'a': a }
    blocks.push(<Chunk  key={i} x={xx} y={yy} rgba={rgba} w={opts.bw} h={opts.bh}/>)
  }
  return blocks
}

exports = module.exports = PluginFilterByType
