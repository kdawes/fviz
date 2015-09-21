var Proc = function() {
  var state = {
    animInterval : 750,
    idleCount : 0,
    rendered : 0,
    worker : null,
    blocks : [],
    renderedList : [],
    w:0,
    h:0,
    bw:0,
    bh:0,
    grid:false,
    engine:null
  }

  var fillblock = function(context, w, h, blk ) {
    if ( undefined === context ) {
      return
    }
    var b = context.createImageData(w,h)
    //magic 4 because rgba - one byte for each
    for (x = 0; x < b.data.length ; x+= 4) {
      b.data[x+0]  = blk.rgba.r
      b.data[x+1]  = blk.rgba.g
      b.data[x+2]  = blk.rgba.b
      b.data[x+3]  = blk.rgba.a
    }

    return b
  }

  function render() {
    console.log("render..." + state.blocks.length  + " " + state.w +  "  " + state.h )
    $("#messages").html("<h3><b>RENDERING</b></h3>")
    var tester = document.createElement("canvas"),
    ctx = tester.getContext("2d")
    var c = document.getElementById("sandbox"),  ctx2 = c.getContext("2d")
    ctx2.canvas.width =  state.w
    ctx2.canvas.height = state.h
    console.log("BLOCK[0] " + JSON.stringify(state.blocks[0]))
    state.blocks.forEach(function(block) {
      var w = ( state.grid && state.bw > 2) ? state.bw - 1 : state.bw
      var h = ( state.grid && state.bh > 2) ? state.bh - 1 : state.bh
      var imgdata = fillblock(ctx, w, h,  block )
      ctx2.putImageData(imgdata, block.x, block.y)
    })
    console.log("drawing to sandbox")
    ctx.drawImage(tester, state.w, state.h)
  }

  var fns = {
    setupEngine: function() {
      state.worker  = new Worker('js/shannon.js')
      state.worker.onmessage = function( ev ) {
        console.log("ONMESSAGE WORKER ")
        if ( ev.data ) {
          console.log("ev.data.length : " + ev.data.length)
          try {
            state.blocks = JSON.parse(ev.data)
          } catch ( e ) {
            console.log("onmessage : ERROR parsing input" + JSON.stringify(e))
          }
        } else {
          //If we are done receiving - start rendering
          console.log("Starting anim interval")
          render()
          state.worker.terminate()
        }
      }
      return state
    },
    go: function(opts) {
      fns.setupEngine()
      var width = opts.width || 2
      var height = opts.height || 2
      state.w = opts.spanw
      state.h = opts.spanh
      state.bw = width
      state.bh = height
      state.grid = opts.grid
      state.engine = opts.engine

      state.worker.postMessage({
        "engine":opts.engine,
        "spanw":opts.spanw,
        "spanh":opts.spanh,
        "block": { "width":width, "height":height}
      })

    }
  }

  return fns
}

exports = module.exports = Proc
