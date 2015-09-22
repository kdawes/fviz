var log = console.log.bind(console, 'DBG>')
var ee = require('events').EventEmitter
var util = require('util') // the node utils
var Util = require('./Utils') // my junk
var u = new Util()

function PluginEngine () {
  if (!(this instanceof PluginEngine)) {
    return new PluginEngine()
  }
  self = this

  this.run = function(opts) {
    self.plugin = (function (){
      if (opts.engine && opts.engine.type) {
        switch(opts.engine.type) {
          case 'raw':
          return pluginRaw
          break
          case 'filter':
          return pluginFilter
          break
          case 'shannon':
          return pluginShannon
          break
          default: throw new Error('unsupported plugin')
        }
      } else {
        throw new Error('no engine or engine not supported')
      }
    })()
    return self.plugin(opts).run()
  }
}

function pluginFilter (opts) {
  log('PLUGINFILTER', ' opts ', JSON.stringify(opts))
  var blocks = []
  return {
    run: function() {
      log('RUNNING')
      var raw = opts.data
      var re = /[\x20-\x7E]/
      for (var i = 0; i < raw.length; i++) {
        var y = Math.floor(i * opts.bw / opts.spanw)
        var xx = (i * opts.bw) % opts.spanw
        var yy = (y * opts.bh)
        //log('xx ', xx, ' yy ', yy, ' y ', y, ' i ', i, ' raw[i] ', raw[i])
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
  }
}
// given opts of : ... XXX fixme
// api : run()  -> return a [] of blocks
function pluginShannon (opts) {
  log('pluginShannon')
  return {
    run: function() {
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
    }//run
  }//return
}//pluginShannon

function pluginRaw (opts) {
  log('PLUGINRAW')
  return {
    run: function() {
      var blocks = []
      var raw = opts.data
      for (var i = 0; i < raw.length; i++) {
        var y = Math.floor(i * opts.bw / opts.spanw)
        var xx = (i * opts.bw) % opts.spanw
        var yy = (y * opts.bh)
        var r,g,b,a = 0
        blocks.push({
          'raw': raw[i],
          'rgba': { 'r': 0, 'g': 0, 'b': raw[i], 'a': raw[i] },
          'x': xx,
          'y': yy
        })
      }
      return blocks
    }
  }
}
// //shannon: function (bytes) {
// // var sums = 0
// // Object.keys(bytes).forEach(function (k) {
// //   var p = pct(k); sums += p * log2(p)
// // })
// // console.log('Shannon entropy ' + -1 * sums)
// //},
function chunked_shannon(opts) {
  console.log('CHUNKED SHANNON ' + JSON.stringify(opts.ctx))
  var r = []
  var sz = 64 //XXX fixme - should come from opts
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

exports = module.exports = PluginEngine
