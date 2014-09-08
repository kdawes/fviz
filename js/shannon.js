var Proc = function(  ) {
 var bytes = {};
 var raw;

 function getBytes(cb) {
  console.log("getBytes");
  var xhr = new XMLHttpRequest();

  xhr.open('GET', '/test.png', true); 
  xhr.responseType = 'arraybuffer';
  xhr.onload = function(e) {
   var words = new Uint8Array(this.response);
   cb(null, words);
  };
  xhr.send();
 }

 var historize = function( bytes_data ) {
  var dd = 0;
  var bb = {};
  for ( i = 0; i < bytes_data.length; i ++ ) { 
   if ( undefined === bb[bytes_data[i]] ) {
    bb[bytes_data[i]] = 1;
   } else {
    bb[bytes_data[i]]++;
   }
  }

  return bb;
 }

 var log2 = function( x ) {
  return Math.log(x) / Math.log(2);
 };

 //exported functions
 var fns = { 
  process: function( data ) {
   //console.log('processing ' + data.length + ' bytes');
   raw = data;
   var i = 0;
   
   bytes = historize( data );

   return data.length;
  },
  summarize: function(type){ 
   if ( undefined === type || type === 'full') {
    _.each(_.keys( bytes ), function( k ) {
     console.log('item ' + k + ' : ' + bytes[k]);
    });
   } else if ( type === 'short' ) {
    console.log('# of individual bytes : ' + _.keys( bytes ).length);
    console.log('Total bytes : ' + raw.length);
   }
  },
  shannon: function(  ) {
   //_.each(_.keys(bytes), function( k ) {
   // console.log('pct : ' + pct(k));
   //});
   var sums = 0;
   _.each(_.keys(bytes), function(k) { 
    var p = pct(k); sums += p * log2(p);  
   });
   console.log('Shannon entropy ' +  -1 * sums);

  },
  chunked_shannon: function(sz) { 
   var left = raw.length;
   var idx = 0;
   var count = 0;
   var chunk_size = ( undefined === sz ) ? 20 : sz;
   do { 
    var sums = 0;
    var n = (left >= chunk_size) ? chunk_size : left;
    var chunk = raw.slice(idx, idx + n);
    var hist = historize(chunk);
    _.each(_.keys( hist ), function( k ) {
     var p = hist[k] / chunk.length;
     sums += p * log2(p);
    });
    console.log(count + ' : ' + -1 * sums);

    left -= n;
    idx += n;
    count ++;
   } while ( left > 0);
  },
  fillblock: function(context, r,g,b,a) { 
   if ( undefined === context ) {
    return;
   }
   var red = r || 0;
   var green   = g || 0;
   var blue  = b || 0;
   var alpha = a || 255;

   var block = context.createImageData(8,8);
   //magic 4 because rgba - one byte for each
   for (x = 0; x < block.width * block.height * 4; x+= 4) {
    block.data[x]  = red;
    block.data[x+1]= green;
    block.data[x+2]= blue;
    block.data[x+3]= alpha;
   }

   return block;
  },
  buildIt: function(ctx) {
   var that = this;
   console.log('buildIt')
   getBytes(function(e,r) {
    if ( e != null ) {
     console.log("ERROR " + e);
    } else { 
     raw = r;
     var i = 0;
	 var re = /[\x20-\x7E]/;
   var blocks = [];


     for( i = 0; i < raw.length; i++ ) {
      if ( blocks.length >= 2000 ) {
        console.log("postMessage with blocks.length : " + blocks.length)
        postMessage(JSON.stringify(blocks));
        blocks = [];
        console.log("blocks.length " + blocks.length);
      }
      var y = Math.floor(i * ctx.block.width / 1024);
      if ( raw[i] === 0xff ) {
         blocks.push({ "rgba": { "r":255, "g":0, "b":0 , "a":255 },
                     "x":(i * ctx.block.width) %1024,
                     "y":(y * ctx.block.height) });
       } else if ( raw[i] === 0x0 ) {
       blocks.push({ "rgba": { "r":0, "g":255, "b":0 , "a":255 },
                   "x":(i * ctx.block.width) %1024,
                   "y":(y * ctx.block.height) });
      } else if (  re.test(raw[i]) ) {
       blocks.push({ "rgba": { "r":255, "g":255, "b":255 , "a":0 },
                   "x":(i * ctx.block.width) %1024,
                   "y":(y * ctx.block.height) });
      } else {
       // console.log("else");
       blocks.push({ "rgba": { "r":0, "g":0, "b":0 , "a":0 },
                   "x":(i * ctx.block.width) %1024,
                   "y":(y * ctx.block.height) });
      }
     }
    }

   });
  }
 };

 return fns;
};

onmessage = function( oev ) { 
 // console.log("Shannon worker onmessage handler : BLOCK "+ JSON.stringify(oev.data));
  var p = new Proc();
  p.buildIt(oev.data);
 };

