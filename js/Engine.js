

var PluginEngine = require('./PluginEngine')
var Utils = require('./Utils')
var u = new Utils()

var React = require('react')

var Slate = require('./Slate')

// Houses the PluginEngine
// pluginEngine generates the shard / slate
function Engine () {
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
      bw: opts.width || 6,
      bh: opts.height || 6,
      spanw: opts.spanw || 512,
      grid: opts.grid || true,
      engine: opts.engine || 'filter',
      data: state.data
    })

    return blocks
  }

  return {
    run: function (opts, cb) {
      u.getBytes('/img', function doIt(e, r) {
        if (e) throw new Error('failed data fetch')
        opts.data = r
        state.blocks = setupEngine(opts)
        cb(null, <Slate data={state}/>)
      })
    }
  }
}

exports = module.exports = Engine
