var Utils = function() {

  var state = {
        animFnId : null,
        animInterval : 750,
        idleCount : 0,
        rendered : 0,
        worker : null,
        blocks : [],
        renderedList : []
      };
      


  var fillblock = function(context, r,g,b,a) { 
    if ( undefined === context ) {
      return;
    }
    var red = r || 0;
    var green   = g || 0;
    var blue  = b || 0;
    var alpha = a || 255;

    var block = context.createImageData(8,8);
    //magic 4 because rgba - one byte for each
    for (x = 0; x < block.width * block.height * 4 ; x+= 4) {
      block.data[x]  = red;
      block.data[x+1]= green;
      block.data[x+2]= blue;
      block.data[x+3]= alpha;
    }
    return block;
  };

  function render() {
    console.log("render..." + state.blocks.length );
    $("#messages").html("<h3><b>RENDERING</b></h3>");
    var tester = document.createElement("canvas"),  
    ctx = tester.getContext("2d"); 
    var c = document.getElementById("sandbox"),  ctx2 = c.getContext("2d"); 
    ctx2.canvas.width = 2048;
    ctx2.canvas.height = 4096;
    state.blocks.forEach(function(block) {
      var imgdata = fillblock(ctx, 
                       block.block, 
                       block.rgba.r, 
                       block.rgba.g, 
                       block.rgba.b, 
                       block.rgba.a);
      ctx2.putImageData(imgdata, block.x, block.y);
       // console.log("->" + JSON.stringify(block));//block.item.x + "," + block.item.y);
    });
    console.log("drawing to sandbox");
    ctx.drawImage(tester, 2048, 4096);
  }

  var fns = {
    setupAnimInterval : function(interval, renderCallback) {
     // return setInterval(function() {
     //   requestAnimationFrame(renderCallback);
     // },interval || 750)
      renderCallback();
    },
    setupEngine: function() {
      var workerstream = require('./index')
      var worker = workerstream('demo-worker.js')

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
      state.worker.postMessage({ "block": { "width":width, "height":height}});
    }
  };


  this.engine = fns.setupEngine();
  var that = this;
  return fns;
};

exports = module.exports = Utils;
