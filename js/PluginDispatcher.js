var PluginEngine = require('./PluginEngine')
var Utils = require('./Utils')

// Houses the PluginEngine
// pluginEngine generates the shard / slate component
function PluginDispatcher () {
  var state = {
    engine: null,
    blocks: []
  }
  function setupEngine (opts, data) {
    console.log('setupEngine ')
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
      data: data
    })

    return blocks
  }

  return {
    run: function (opts, data) {
      console.log('running it!')
      return setupEngine(opts, data)
    }
  }
}
exports = module.exports = PluginDispatcher
