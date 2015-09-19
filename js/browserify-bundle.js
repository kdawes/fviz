(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//var work = require('webworkify');
var W = require('./shannon.js')
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
  };

  var fillblock = function(context, w, h, blk ) {
    if ( undefined === context ) {
      return;
    }
    var b = context.createImageData(w,h);
    //magic 4 because rgba - one byte for each
    for (x = 0; x < b.data.length ; x+= 4) {
      b.data[x+0]  = blk.rgba.r;
      b.data[x+1]  = blk.rgba.g;
      b.data[x+2]  = blk.rgba.b;
      b.data[x+3]  = blk.rgba.a;
    }

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
      var w = ( state.grid && state.bw > 2) ? state.bw - 1 : state.bw;
      var h = ( state.grid && state.bh > 2) ? state.bh - 1 : state.bh;
      var imgdata = fillblock(ctx, w, h,  block );
      ctx2.putImageData(imgdata, block.x, block.y);

    });
    console.log("drawing to sandbox");
    ctx.drawImage(tester, state.w, state.h);
  }

  var fns = {
    setupEngine: function() {
//      var w = work(require('./worker.js'));
     // state.worker = work(require('./shannon.js'));
      state.worker  = new Worker('shannon.js');
      state.worker.onmessage = function( ev ) {
        console.log("ONMESSAGE WORKER ");
        if ( ev.data ) {
          console.log("ev.data.length : " + ev.data.length);
          try {
            state.blocks = JSON.parse(ev.data);
          } catch ( e ) {
            console.log("onmessage : ERROR parsing input" + JSON.stringify(e));
          }
        } else {
          //If we are done receiving - start rendering
          console.log("Starting anim interval");
          render();
          state.worker.terminate();
        }
      }
      return state;
    },
    go: function(opts) {
      fns.setupEngine();
      var width = opts.width || 2;
      var height = opts.height || 2;
      state.w = opts.spanw;
      state.h = opts.spanh
      state.bw = width;
      state.bh = height;
      state.grid = opts.grid;
      state.engine = opts.engine;

      state.worker.postMessage({
        "engine":opts.engine,
        "spanw":opts.spanw,
        "spanh":opts.spanh,
        "block": { "width":width, "height":height}
      });

    }
  };




  return fns;
};

exports = module.exports = Proc;

},{"./shannon.js":3}],2:[function(require,module,exports){
      var Proc = require('./Proc.js');
      var shannon = require('./shannon.js')
      var engine = new Proc()
      var director = require('director'),
       Router = new director.http.Router()
      // var opts = {
      //   "interval":500,
      //   "count":32,
      //   "cb" : function(e,r) {
      //     console.log("cb!" + JSON.stringify(r));
      //     $('#messages').html(JSON.stringify(r));
      //   },
      // }
      // console.log("periodic");
      // var Periodic = require('Periodic');
      // console.log("Required periodic - instanceOf ? " + (Periodic instanceof Periodic));
      // var p = new Periodic(opts);
      // console.log("new Periodic() instanceof ? "+ ( p instanceof Periodic));
      // var Runner = require('Runner');
      // var r = new Runner();
      // r.add(p);
      // r.startall();

      var routes = {
        '/filter': filter,
        '/shannon': shannon,
        '/raw': raw,
        '/list': list,
        "/":list
      };

      var config = {
        "engine": {
        },
        "width":6,
        "height":6,
        "spanw":2048,
        "spanh":16384,
        "grid":false
      };

      function shannon() {
        console.log("SHannon route");
        var cfg = _.cloneDeep(config);
        cfg.engine.blksz = 20;
        cfg.engine.type = "shannon";
        engine.go(cfg);
      }

      function filter() {
        console.log("Filter route");
        var cfg = _.cloneDeep(config);
        cfg.engine.type = "filter";
        cfg.width=5;
        cfg.height=5;
        cfg.grid = true;
        engine.go(cfg);
      }

      function raw() {
        console.log("raw route");
        var cfg = _.cloneDeep(config);
        cfg.engine.type = "raw";
        cfg.grid = true;
        engine.go(cfg);
      }

      function list() {
        $().ready(function(){
          $("#msgs").empty();
          Object.keys(routes).forEach(function(r) {
            var ctnt = "<a href='/#" + r +"'>"+ r +"</a>";
            console.log("LIST :> " + ctnt);

            $("#msgs").append(ctnt + " </br>");

          });
        });
      }

      var router = Router(routes);

      router.init();

},{"./Proc.js":1,"./shannon.js":3,"director":4}],3:[function(require,module,exports){
//var msgpack = require('msgpack-js');
exports = module.exports = shannon;
function shannon() {
  function getBytes(cb) {
    console.log("getBytes");
    var xhr = new XMLHttpRequest();

    xhr.open('GET', '/img', true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
      console.log("XHR load");
      var words = new Uint8Array(this.response);
      console.log("WE GOT " + words.length );
      cb(null, words);
    };
    console.log("XHR SEND");
    xhr.send();
  }

  function historize( bytes_data ) {
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
  };

  function log2( x ) {
    return Math.log(x) / Math.log(2);
  };

  function pluginFilter(opts) {
        var ctx = opts.ctx;
    var blocks = [];
    var raw = opts.data;
    var i = 0;
    var re =  /[\x20-\x7E]/;
    for( i = 0; i < raw.length; i++ ) {
      var y = Math.floor(i * ctx.block.width / ctx.spanw);
      var xx = (i * ctx.block.width) % ctx.spanw;
      var yy = (y * ctx.block.height);

      if ( raw[i] === 0xff ) {
        blocks.push({ "raw": raw[i], "rgba": { "r":255, "g":0, "b":0 , "a": 255 },
                "x": xx,
                "y":yy });
      } else if ( raw[i] === 0x0 ) {
        blocks.push({ "raw": raw[i], "rgba": { "r":0, "g":255, "b":0, "a": 255},
                "x": xx,
                "y":yy });

      } else if (  re.test(raw[i]) ) {
        blocks.push({ "raw": raw[i],"rgba": { "r":0, "g":0, "b":255 , "a":255 },
                "x": xx,
                "y":yy });

      } else {
        blocks.push({ "raw": raw[i], "rgba": { "r":255, "g":255, "b":255, "a":255},
                "x": xx,
                "y":yy });
      }
    }
    return blocks;
  };

    function pluginShannon(opts){
      //console.log("pluginShanon " + JSON.stringify(opts.ctx,null,2));
        var blocks = [];
        var ctx = opts.ctx;
        var raw = opts.data;
        var tmp = fns.chunked_shannon(opts);
        for( i = 0; i < tmp.length; i++) {
          var y = Math.floor(i * ctx.block.width / ctx.spanw);
      var xx = (i * ctx.block.width) % ctx.spanw;
      var yy = (y * ctx.block.height);
      blocks.push({ "raw": tmp[i],"rgba": { "r":tmp[i] * 1.095, "g":0, "b":0 , "a": tmp[i] << 1.75 },
                  "x": xx,
                  "y": yy });
        }
        return blocks;
    }

    function pluginRaw(opts){
      //console.log("pluginShanon " + JSON.stringify(opts.ctx,null,2));
        var blocks = [];
        var ctx = opts.ctx;
        var raw = opts.data;
        var c = 0;
   //      for( i = 0; i < raw.length; i++, c+=4) {
   //      	var y = Math.floor(i * ctx.block.width / ctx.spanw);
      // var xx = (i * ctx.block.width) % ctx.spanw;
      // var yy = (y * ctx.block.height);
      // blocks.push({ "raw": raw[i],"rgba": { "r":raw[i] , "g": raw[i], "b": raw[i] , "a": 255 },
      //             "x": xx,
      //             "y":yy });
   //      }
   //      return blocks;
         for ( i = 0; i < raw.length; i++ ){

         }
         return blocks;
  }

  //exported functions
  var fns = {
    normalize : function( data ) {
      //x = x - xmin / xmax - xmin => (( x - 0 ) / 255 - 0) * 255
      var n = new Uint8Array(data.length);
      for(i = 0; i < data.length; i++ ) {
        n[i] = (data[i] - 1)/ (255 - 1) * 255;
      }
      return n;
    },
    shannon: function(  ) {
      var sums = 0;
      Object.keys(bytes).forEach(function(k) {
        var p = pct(k); sums += p * log2(p);
      });
      console.log('Shannon entropy ' +  -1 * sums);
    },
    chunked_shannon: function(opts) {
      console.log("CHUNKED SHANNON "  + JSON.stringify(opts.ctx));
      var r = [];
            var sz = opts.ctx.engine.blksz;
            var raw = opts.data;
      var left = raw.length;

      var idx = 0;
      var count = 0;

      var chunk_size = ( undefined === sz ) ? 20 : sz;
      do {
        var sums = 0;
        var n = (left >= chunk_size) ? chunk_size : left;
        var chunk = raw.subarray(idx, idx + n);
        var hist = historize(chunk);
        Object.keys( hist ).forEach(function( k ) {
          var p = hist[k] / chunk.length;
          sums += p * log2(p);
        });
      //	console.log(count + ' : ' + -1 * sums);
        r.push(-i * sums);
        left -= n;
        idx += n;
        count ++;
      } while ( left > 0 );
      return r;
    },

    buildIt: function(ctx, cb) {
      var that = this;
      console.log('buildIt  ' + JSON.stringify(ctx));

      if ( ctx == null ) {
        console.log("Null context - returning");
        return;
      }

      getBytes(function(e,r) {
        if ( e != null ) {
          console.log("ERROR " + e);
          return cb(e, null);
        }

        console.log("ENGINE " + ctx.engine);

        switch ( ctx.engine.type ) {
          case  "shannon":
          return cb(null, pluginShannon({"data":fns.normalize(r), "ctx":ctx}));
          break;
          case  "filter" :
          return cb(null, pluginFilter({"data":r, "ctx":ctx}));
          break;
          case  "raw" :
          return cb(null, pluginRaw({"data":r, "ctx":ctx}));
          break;
        }
      });
    }
  };

  return fns;
};


// Onmessage for webworker support
onmessage = function( oev ) {
  var LIMIT_DATA = 1000000;

  if ( oev.data ) {
    console.log("TYPEOF " + oev.data);
    console.log("Shannon worker onmessage handler : BLOCK "+ JSON.stringify(oev.data));
    var p = new shannon();
    p.buildIt(oev.data, function( e, r ) {
      if ( e ) {  console.log ("ERROR " +  e); return; }
      console.log("Got bytes : " + r.length);
      var intervalId = setInterval(function() {
        console.log("1234 postMessage with bytes.length : " + r.length)
        postMessage(JSON.stringify(r.splice(0, LIMIT_DATA)));
        //console.log("bytes.length " + results.length);
        if ( r.length === 0 ) {
          console.log("CLEARING webworker interval - data is done");
          clearInterval(intervalId);
          postMessage(null);
        }
      }, 500);
    });
  }
};

},{}],4:[function(require,module,exports){


//
// Generated on Tue Dec 16 2014 12:13:47 GMT+0100 (CET) by Charlie Robbins, Paolo Fragomeni & the Contributors (Using Codesurgeon).
// Version 1.2.6
//

(function (exports) {

/*
 * browser.js: Browser specific functionality for director.
 *
 * (C) 2011, Charlie Robbins, Paolo Fragomeni, & the Contributors.
 * MIT LICENSE
 *
 */

var dloc = document.location;

function dlocHashEmpty() {
  // Non-IE browsers return '' when the address bar shows '#'; Director's logic
  // assumes both mean empty.
  return dloc.hash === '' || dloc.hash === '#';
}

var listener = {
  mode: 'modern',
  hash: dloc.hash,
  history: false,

  check: function () {
    var h = dloc.hash;
    if (h != this.hash) {
      this.hash = h;
      this.onHashChanged();
    }
  },

  fire: function () {
    if (this.mode === 'modern') {
      this.history === true ? window.onpopstate() : window.onhashchange();
    }
    else {
      this.onHashChanged();
    }
  },

  init: function (fn, history) {
    var self = this;
    this.history = history;

    if (!Router.listeners) {
      Router.listeners = [];
    }

    function onchange(onChangeEvent) {
      for (var i = 0, l = Router.listeners.length; i < l; i++) {
        Router.listeners[i](onChangeEvent);
      }
    }

    //note IE8 is being counted as 'modern' because it has the hashchange event
    if ('onhashchange' in window && (document.documentMode === undefined
      || document.documentMode > 7)) {
      // At least for now HTML5 history is available for 'modern' browsers only
      if (this.history === true) {
        // There is an old bug in Chrome that causes onpopstate to fire even
        // upon initial page load. Since the handler is run manually in init(),
        // this would cause Chrome to run it twise. Currently the only
        // workaround seems to be to set the handler after the initial page load
        // http://code.google.com/p/chromium/issues/detail?id=63040
        setTimeout(function() {
          window.onpopstate = onchange;
        }, 500);
      }
      else {
        window.onhashchange = onchange;
      }
      this.mode = 'modern';
    }
    else {
      //
      // IE support, based on a concept by Erik Arvidson ...
      //
      var frame = document.createElement('iframe');
      frame.id = 'state-frame';
      frame.style.display = 'none';
      document.body.appendChild(frame);
      this.writeFrame('');

      if ('onpropertychange' in document && 'attachEvent' in document) {
        document.attachEvent('onpropertychange', function () {
          if (event.propertyName === 'location') {
            self.check();
          }
        });
      }

      window.setInterval(function () { self.check(); }, 50);

      this.onHashChanged = onchange;
      this.mode = 'legacy';
    }

    Router.listeners.push(fn);

    return this.mode;
  },

  destroy: function (fn) {
    if (!Router || !Router.listeners) {
      return;
    }

    var listeners = Router.listeners;

    for (var i = listeners.length - 1; i >= 0; i--) {
      if (listeners[i] === fn) {
        listeners.splice(i, 1);
      }
    }
  },

  setHash: function (s) {
    // Mozilla always adds an entry to the history
    if (this.mode === 'legacy') {
      this.writeFrame(s);
    }

    if (this.history === true) {
      window.history.pushState({}, document.title, s);
      // Fire an onpopstate event manually since pushing does not obviously
      // trigger the pop event.
      this.fire();
    } else {
      dloc.hash = (s[0] === '/') ? s : '/' + s;
    }
    return this;
  },

  writeFrame: function (s) {
    // IE support...
    var f = document.getElementById('state-frame');
    var d = f.contentDocument || f.contentWindow.document;
    d.open();
    d.write("<script>_hash = '" + s + "'; onload = parent.listener.syncHash;<script>");
    d.close();
  },

  syncHash: function () {
    // IE support...
    var s = this._hash;
    if (s != dloc.hash) {
      dloc.hash = s;
    }
    return this;
  },

  onHashChanged: function () {}
};

var Router = exports.Router = function (routes) {
  if (!(this instanceof Router)) return new Router(routes);

  this.params   = {};
  this.routes   = {};
  this.methods  = ['on', 'once', 'after', 'before'];
  this.scope    = [];
  this._methods = {};

  this._insert = this.insert;
  this.insert = this.insertEx;

  this.historySupport = (window.history != null ? window.history.pushState : null) != null

  this.configure();
  this.mount(routes || {});
};

Router.prototype.init = function (r) {
  var self = this
    , routeTo;
  this.handler = function(onChangeEvent) {
    var newURL = onChangeEvent && onChangeEvent.newURL || window.location.hash;
    var url = self.history === true ? self.getPath() : newURL.replace(/.*#/, '');
    self.dispatch('on', url.charAt(0) === '/' ? url : '/' + url);
  };

  listener.init(this.handler, this.history);

  if (this.history === false) {
    if (dlocHashEmpty() && r) {
      dloc.hash = r;
    } else if (!dlocHashEmpty()) {
      self.dispatch('on', '/' + dloc.hash.replace(/^(#\/|#|\/)/, ''));
    }
  }
  else {
    if (this.convert_hash_in_init) {
      // Use hash as route
      routeTo = dlocHashEmpty() && r ? r : !dlocHashEmpty() ? dloc.hash.replace(/^#/, '') : null;
      if (routeTo) {
        window.history.replaceState({}, document.title, routeTo);
      }
    }
    else {
      // Use canonical url
      routeTo = this.getPath();
    }

    // Router has been initialized, but due to the chrome bug it will not
    // yet actually route HTML5 history state changes. Thus, decide if should route.
    if (routeTo || this.run_in_init === true) {
      this.handler();
    }
  }

  return this;
};

Router.prototype.explode = function () {
  var v = this.history === true ? this.getPath() : dloc.hash;
  if (v.charAt(1) === '/') { v=v.slice(1) }
  return v.slice(1, v.length).split("/");
};

Router.prototype.setRoute = function (i, v, val) {
  var url = this.explode();

  if (typeof i === 'number' && typeof v === 'string') {
    url[i] = v;
  }
  else if (typeof val === 'string') {
    url.splice(i, v, s);
  }
  else {
    url = [i];
  }

  listener.setHash(url.join('/'));
  return url;
};

//
// ### function insertEx(method, path, route, parent)
// #### @method {string} Method to insert the specific `route`.
// #### @path {Array} Parsed path to insert the `route` at.
// #### @route {Array|function} Route handlers to insert.
// #### @parent {Object} **Optional** Parent "routes" to insert into.
// insert a callback that will only occur once per the matched route.
//
Router.prototype.insertEx = function(method, path, route, parent) {
  if (method === "once") {
    method = "on";
    route = function(route) {
      var once = false;
      return function() {
        if (once) return;
        once = true;
        return route.apply(this, arguments);
      };
    }(route);
  }
  return this._insert(method, path, route, parent);
};

Router.prototype.getRoute = function (v) {
  var ret = v;

  if (typeof v === "number") {
    ret = this.explode()[v];
  }
  else if (typeof v === "string"){
    var h = this.explode();
    ret = h.indexOf(v);
  }
  else {
    ret = this.explode();
  }

  return ret;
};

Router.prototype.destroy = function () {
  listener.destroy(this.handler);
  return this;
};

Router.prototype.getPath = function () {
  var path = window.location.pathname;
  if (path.substr(0, 1) !== '/') {
    path = '/' + path;
  }
  return path;
};
function _every(arr, iterator) {
  for (var i = 0; i < arr.length; i += 1) {
    if (iterator(arr[i], i, arr) === false) {
      return;
    }
  }
}

function _flatten(arr) {
  var flat = [];
  for (var i = 0, n = arr.length; i < n; i++) {
    flat = flat.concat(arr[i]);
  }
  return flat;
}

function _asyncEverySeries(arr, iterator, callback) {
  if (!arr.length) {
    return callback();
  }
  var completed = 0;
  (function iterate() {
    iterator(arr[completed], function(err) {
      if (err || err === false) {
        callback(err);
        callback = function() {};
      } else {
        completed += 1;
        if (completed === arr.length) {
          callback();
        } else {
          iterate();
        }
      }
    });
  })();
}

function paramifyString(str, params, mod) {
  mod = str;
  for (var param in params) {
    if (params.hasOwnProperty(param)) {
      mod = params[param](str);
      if (mod !== str) {
        break;
      }
    }
  }
  return mod === str ? "([._a-zA-Z0-9-%()]+)" : mod;
}

function regifyString(str, params) {
  var matches, last = 0, out = "";
  while (matches = str.substr(last).match(/[^\w\d\- %@&]*\*[^\w\d\- %@&]*/)) {
    last = matches.index + matches[0].length;
    matches[0] = matches[0].replace(/^\*/, "([_.()!\\ %@&a-zA-Z0-9-]+)");
    out += str.substr(0, matches.index) + matches[0];
  }
  str = out += str.substr(last);
  var captures = str.match(/:([^\/]+)/ig), capture, length;
  if (captures) {
    length = captures.length;
    for (var i = 0; i < length; i++) {
      capture = captures[i];
      if (capture.slice(0, 2) === "::") {
        str = capture.slice(1);
      } else {
        str = str.replace(capture, paramifyString(capture, params));
      }
    }
  }
  return str;
}

function terminator(routes, delimiter, start, stop) {
  var last = 0, left = 0, right = 0, start = (start || "(").toString(), stop = (stop || ")").toString(), i;
  for (i = 0; i < routes.length; i++) {
    var chunk = routes[i];
    if (chunk.indexOf(start, last) > chunk.indexOf(stop, last) || ~chunk.indexOf(start, last) && !~chunk.indexOf(stop, last) || !~chunk.indexOf(start, last) && ~chunk.indexOf(stop, last)) {
      left = chunk.indexOf(start, last);
      right = chunk.indexOf(stop, last);
      if (~left && !~right || !~left && ~right) {
        var tmp = routes.slice(0, (i || 1) + 1).join(delimiter);
        routes = [ tmp ].concat(routes.slice((i || 1) + 1));
      }
      last = (right > left ? right : left) + 1;
      i = 0;
    } else {
      last = 0;
    }
  }
  return routes;
}

var QUERY_SEPARATOR = /\?.*/;

Router.prototype.configure = function(options) {
  options = options || {};
  for (var i = 0; i < this.methods.length; i++) {
    this._methods[this.methods[i]] = true;
  }
  this.recurse = options.recurse || this.recurse || false;
  this.async = options.async || false;
  this.delimiter = options.delimiter || "/";
  this.strict = typeof options.strict === "undefined" ? true : options.strict;
  this.notfound = options.notfound;
  this.resource = options.resource;
  this.history = options.html5history && this.historySupport || false;
  this.run_in_init = this.history === true && options.run_handler_in_init !== false;
  this.convert_hash_in_init = this.history === true && options.convert_hash_in_init !== false;
  this.every = {
    after: options.after || null,
    before: options.before || null,
    on: options.on || null
  };
  return this;
};

Router.prototype.param = function(token, matcher) {
  if (token[0] !== ":") {
    token = ":" + token;
  }
  var compiled = new RegExp(token, "g");
  this.params[token] = function(str) {
    return str.replace(compiled, matcher.source || matcher);
  };
  return this;
};

Router.prototype.on = Router.prototype.route = function(method, path, route) {
  var self = this;
  if (!route && typeof path == "function") {
    route = path;
    path = method;
    method = "on";
  }
  if (Array.isArray(path)) {
    return path.forEach(function(p) {
      self.on(method, p, route);
    });
  }
  if (path.source) {
    path = path.source.replace(/\\\//ig, "/");
  }
  if (Array.isArray(method)) {
    return method.forEach(function(m) {
      self.on(m.toLowerCase(), path, route);
    });
  }
  path = path.split(new RegExp(this.delimiter));
  path = terminator(path, this.delimiter);
  this.insert(method, this.scope.concat(path), route);
};

Router.prototype.path = function(path, routesFn) {
  var self = this, length = this.scope.length;
  if (path.source) {
    path = path.source.replace(/\\\//ig, "/");
  }
  path = path.split(new RegExp(this.delimiter));
  path = terminator(path, this.delimiter);
  this.scope = this.scope.concat(path);
  routesFn.call(this, this);
  this.scope.splice(length, path.length);
};

Router.prototype.dispatch = function(method, path, callback) {
  var self = this, fns = this.traverse(method, path.replace(QUERY_SEPARATOR, ""), this.routes, ""), invoked = this._invoked, after;
  this._invoked = true;
  if (!fns || fns.length === 0) {
    this.last = [];
    if (typeof this.notfound === "function") {
      this.invoke([ this.notfound ], {
        method: method,
        path: path
      }, callback);
    }
    return false;
  }
  if (this.recurse === "forward") {
    fns = fns.reverse();
  }
  function updateAndInvoke() {
    self.last = fns.after;
    self.invoke(self.runlist(fns), self, callback);
  }
  after = this.every && this.every.after ? [ this.every.after ].concat(this.last) : [ this.last ];
  if (after && after.length > 0 && invoked) {
    if (this.async) {
      this.invoke(after, this, updateAndInvoke);
    } else {
      this.invoke(after, this);
      updateAndInvoke();
    }
    return true;
  }
  updateAndInvoke();
  return true;
};

Router.prototype.invoke = function(fns, thisArg, callback) {
  var self = this;
  var apply;
  if (this.async) {
    apply = function(fn, next) {
      if (Array.isArray(fn)) {
        return _asyncEverySeries(fn, apply, next);
      } else if (typeof fn == "function") {
        fn.apply(thisArg, (fns.captures || []).concat(next));
      }
    };
    _asyncEverySeries(fns, apply, function() {
      if (callback) {
        callback.apply(thisArg, arguments);
      }
    });
  } else {
    apply = function(fn) {
      if (Array.isArray(fn)) {
        return _every(fn, apply);
      } else if (typeof fn === "function") {
        return fn.apply(thisArg, fns.captures || []);
      } else if (typeof fn === "string" && self.resource) {
        self.resource[fn].apply(thisArg, fns.captures || []);
      }
    };
    _every(fns, apply);
  }
};

Router.prototype.traverse = function(method, path, routes, regexp, filter) {
  var fns = [], current, exact, match, next, that;
  function filterRoutes(routes) {
    if (!filter) {
      return routes;
    }
    function deepCopy(source) {
      var result = [];
      for (var i = 0; i < source.length; i++) {
        result[i] = Array.isArray(source[i]) ? deepCopy(source[i]) : source[i];
      }
      return result;
    }
    function applyFilter(fns) {
      for (var i = fns.length - 1; i >= 0; i--) {
        if (Array.isArray(fns[i])) {
          applyFilter(fns[i]);
          if (fns[i].length === 0) {
            fns.splice(i, 1);
          }
        } else {
          if (!filter(fns[i])) {
            fns.splice(i, 1);
          }
        }
      }
    }
    var newRoutes = deepCopy(routes);
    newRoutes.matched = routes.matched;
    newRoutes.captures = routes.captures;
    newRoutes.after = routes.after.filter(filter);
    applyFilter(newRoutes);
    return newRoutes;
  }
  if (path === this.delimiter && routes[method]) {
    next = [ [ routes.before, routes[method] ].filter(Boolean) ];
    next.after = [ routes.after ].filter(Boolean);
    next.matched = true;
    next.captures = [];
    return filterRoutes(next);
  }
  for (var r in routes) {
    if (routes.hasOwnProperty(r) && (!this._methods[r] || this._methods[r] && typeof routes[r] === "object" && !Array.isArray(routes[r]))) {
      current = exact = regexp + this.delimiter + r;
      if (!this.strict) {
        exact += "[" + this.delimiter + "]?";
      }
      match = path.match(new RegExp("^" + exact));
      if (!match) {
        continue;
      }
      if (match[0] && match[0] == path && routes[r][method]) {
        next = [ [ routes[r].before, routes[r][method] ].filter(Boolean) ];
        next.after = [ routes[r].after ].filter(Boolean);
        next.matched = true;
        next.captures = match.slice(1);
        if (this.recurse && routes === this.routes) {
          next.push([ routes.before, routes.on ].filter(Boolean));
          next.after = next.after.concat([ routes.after ].filter(Boolean));
        }
        return filterRoutes(next);
      }
      next = this.traverse(method, path, routes[r], current);
      if (next.matched) {
        if (next.length > 0) {
          fns = fns.concat(next);
        }
        if (this.recurse) {
          fns.push([ routes[r].before, routes[r].on ].filter(Boolean));
          next.after = next.after.concat([ routes[r].after ].filter(Boolean));
          if (routes === this.routes) {
            fns.push([ routes["before"], routes["on"] ].filter(Boolean));
            next.after = next.after.concat([ routes["after"] ].filter(Boolean));
          }
        }
        fns.matched = true;
        fns.captures = next.captures;
        fns.after = next.after;
        return filterRoutes(fns);
      }
    }
  }
  return false;
};

Router.prototype.insert = function(method, path, route, parent) {
  var methodType, parentType, isArray, nested, part;
  path = path.filter(function(p) {
    return p && p.length > 0;
  });
  parent = parent || this.routes;
  part = path.shift();
  if (/\:|\*/.test(part) && !/\\d|\\w/.test(part)) {
    part = regifyString(part, this.params);
  }
  if (path.length > 0) {
    parent[part] = parent[part] || {};
    return this.insert(method, path, route, parent[part]);
  }
  if (!part && !path.length && parent === this.routes) {
    methodType = typeof parent[method];
    switch (methodType) {
     case "function":
      parent[method] = [ parent[method], route ];
      return;
     case "object":
      parent[method].push(route);
      return;
     case "undefined":
      parent[method] = route;
      return;
    }
    return;
  }
  parentType = typeof parent[part];
  isArray = Array.isArray(parent[part]);
  if (parent[part] && !isArray && parentType == "object") {
    methodType = typeof parent[part][method];
    switch (methodType) {
     case "function":
      parent[part][method] = [ parent[part][method], route ];
      return;
     case "object":
      parent[part][method].push(route);
      return;
     case "undefined":
      parent[part][method] = route;
      return;
    }
  } else if (parentType == "undefined") {
    nested = {};
    nested[method] = route;
    parent[part] = nested;
    return;
  }
  throw new Error("Invalid route context: " + parentType);
};



Router.prototype.extend = function(methods) {
  var self = this, len = methods.length, i;
  function extend(method) {
    self._methods[method] = true;
    self[method] = function() {
      var extra = arguments.length === 1 ? [ method, "" ] : [ method ];
      self.on.apply(self, extra.concat(Array.prototype.slice.call(arguments)));
    };
  }
  for (i = 0; i < len; i++) {
    extend(methods[i]);
  }
};

Router.prototype.runlist = function(fns) {
  var runlist = this.every && this.every.before ? [ this.every.before ].concat(_flatten(fns)) : _flatten(fns);
  if (this.every && this.every.on) {
    runlist.push(this.every.on);
  }
  runlist.captures = fns.captures;
  runlist.source = fns.source;
  return runlist;
};

Router.prototype.mount = function(routes, path) {
  if (!routes || typeof routes !== "object" || Array.isArray(routes)) {
    return;
  }
  var self = this;
  path = path || [];
  if (!Array.isArray(path)) {
    path = path.split(self.delimiter);
  }
  function insertOrMount(route, local) {
    var rename = route, parts = route.split(self.delimiter), routeType = typeof routes[route], isRoute = parts[0] === "" || !self._methods[parts[0]], event = isRoute ? "on" : rename;
    if (isRoute) {
      rename = rename.slice((rename.match(new RegExp("^" + self.delimiter)) || [ "" ])[0].length);
      parts.shift();
    }
    if (isRoute && routeType === "object" && !Array.isArray(routes[route])) {
      local = local.concat(parts);
      self.mount(routes[route], local);
      return;
    }
    if (isRoute) {
      local = local.concat(rename.split(self.delimiter));
      local = terminator(local, self.delimiter);
    }
    self.insert(event, local, routes[route]);
  }
  for (var route in routes) {
    if (routes.hasOwnProperty(route)) {
      insertOrMount(route, path.slice(0));
    }
  }
};



}(typeof exports === "object" ? exports : window));
},{}]},{},[2]);