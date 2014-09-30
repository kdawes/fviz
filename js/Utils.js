var Utils = function() {

  var state = {
        animFnId : null,
        animInterval : 750,
        idleCount : 0,
        rendered : 0,
        worker : null,
        blocks : [],
        renderedList : [],
        w:0,
        h:0
      };
      


  var fillblock = function(context, w, h, blk ) {
    if ( undefined === context ) {
      return;
    }
    var b = context.createImageData(w,h);
    //magic 4 because rgba - one byte for each
    for (x = 0; x < b.data.length ; x+= 4) {
      b.data[x+0]  = blk.rgba.r;//(blk.rgba.r) ? blk.raw : 0;
      b.data[x+1]  = blk.rgba.g;//(blk.rgba.g ) ? blk.raw : 0;
      b.data[x+2]  = blk.rgba.b;//(blk.rgba.b ) ? blk.raw : 0;
      b.data[x+3]  = blk.rgba.a;
    }
//    console.log("fillblk : block" + JSON.stringify(block));
    return b;
  };

  function render() {
    console.log("render..." + state.blocks.length  + " " + state.w +  "  " + state.h );
    $("#messages").html("<h3><b>RENDERING</b></h3>");
    var tester = document.createElement("canvas"),  
    ctx = tester.getContext("2d"); 
    var c = document.getElementById("sandbox"),  ctx2 = c.getContext("2d"); 
    ctx2.canvas.width =  state.w;
    ctx2.canvas.height = state.h;
    console.log("BLOCK[0] " + JSON.stringify(state.blocks[0]));
    state.blocks.forEach(function(block) {
//      console.log(">> block " + JSON.stringify(block));
      var imgdata = fillblock(ctx, 3, 3,  block );

      //console.log("imgdata " + JSON.stringify(imgdata));
      ctx2.putImageData(imgdata, block.x, block.y);
       // console.log("->" + JSON.stringify(block));//block.item.x + "," + block.item.y);
    });
    console.log("drawing to sandbox");
    ctx.drawImage(tester, state.w, state.h);
  }

  var fns = {
    setupAnimInterval : function(interval, renderCallback) {
     // return setInterval(function() {
     //   requestAnimationFrame(renderCallback);
     // },interval || 750)
      renderCallback();
    },
    setupEngine: function() {
      state.worker  = new Worker('js/shannon.js');    
      state.worker.onmessage = function( ev ) {
        console.log("ONMESSAGE WORKER ");
        if ( ev.data ) {
          console.log("ev.data.length : " + ev.data.length);
          var data;
          try { 
            data = JSON.parse(ev.data);
          } catch ( e ) { 
            console.log("onmessage : ERROR parsing input" + JSON.stringify(e));
          }  
          //If we are done receiving - start rendering
          if ( data.length && data.length > 0) {
            //still receiving data
            console.log("index ev.data length  " + data.length);
            data.forEach(function(b) {
              state.blocks.push(b);
            });
          } else { 
            console.log("worker - WTF WTF WTF WTF ? " + data);
          }
        } else {
          console.log("Starting anim interval");
          state.animFnId = fns.setupAnimInterval(100, render);
        }
      }
      return state;
    },
    go: function(opts) {
      var width = opts.width || 2;
      var height = opts.height || 2;
      state.w = opts.spanw;
      state.h = opts.spanh
      state.worker.postMessage({ "spanw":opts.spanw, "spanh":opts.spanh, "block": { "width":width, "height":height}});
    }
  };


  this.engine = fns.setupEngine();
  var that = this;
  return fns;
};

exports = module.exports = Utils;
