var PluginEngine = require('./PluginEngine')
var Utils = require('./Utils')
var u = new Utils()

var React = require('react')
var Slate = require('./Slate')

// Houses the PluginEngine
// pluginEngine generates the shard / slate component
function Dispatcher () {
  var state = {
    engine: null,
    blocks: []
  }
  function setupEngine (opts) {
    state.engine = new PluginEngine()
    for (var f in opts) {
      if (!state.hasOwnProperty(f)) {
        state[f] = opts[f]
      }
    }
    var blocks = state.engine.run({
      bw: opts.width,
      bh: opts.height,
      spanw: opts.spanw,
      grid: opts.grid,
      engine: opts.engine,
      data: state.data
    })

    return blocks
  }

  return {
    run: function (opts, cb) {
      u.getBytes(opts.engine.dataUrl, function doIt (e, r) {
        if (e) throw new Error('failed data fetch')
        opts.data = r
        state.blocks = setupEngine(opts)
        cb(null, <Slate data={state}/>)
      })
    }
  }
}

exports = module.exports = Dispatcher
