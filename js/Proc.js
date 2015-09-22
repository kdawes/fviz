var log = console.log.bind(console, 'DBG>')
var PluginEngine = require('./PluginEngine')
var Utils = require('./Utils')
var u = new Utils()

function Proc () {
  var state = {
    engine: null,
    blocks: []
  }
  function fillblock (context, w, h, blk) {
    if (undefined === context) {
      throw new Error('null context in fillblock')
    }
    var b = context.createImageData(w, h)
    // magic 4 because rgba - one byte for each
    for (var x = 0; x < b.data.length; x += 4) {
      b.data[x + 0] = blk.rgba.r
      b.data[x + 1] = blk.rgba.g
      b.data[x + 2] = blk.rgba.b
      b.data[x + 3] = blk.rgba.a
    }
    return b
  }

  function render () {
    log('render...len ', state.blocks.length, 'state.width ', state.width, 'state.height ', state.height)
    $('#messages').html('<h3><b>RENDERING</b></h3>')
    var tester = document.createElement('canvas')
    var ctx = tester.getContext('2d')
    var c = document.getElementById('sandbox')
    var ctx2 = c.getContext('2d')
    ctx2.canvas.width = state.spanw
    ctx2.canvas.height = state.blocks.length * state.width / state.spanw * state.height
    log('BLOCK[0] ' + JSON.stringify(state.blocks[0]))
    state.blocks.forEach(function (block) {
      var w = (state.grid && state.width > 2) ? state.width - 1 : state.width
      var h = (state.grid && state.height > 2) ? state.height - 1 : state.height
      var imgdata = fillblock(ctx, w, h, block)
      if (imgdata) {
        ctx2.putImageData(imgdata, block.x, block.y)
      }
    })
    log('drawing to sandbox')
    ctx.drawImage(tester, state.w, state.h)
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
    run: function (opts) {
      u.getBytes('/img', function (e, r) {
        if (e) throw new Error('failed data fetch')
        opts.data = r
        state.blocks = setupEngine(opts)
        render()
      })
    }
  }
}

exports = module.exports = Proc
