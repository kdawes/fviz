var require = function (file, cwd) {
    var resolved = require.resolve(file, cwd || '/');
    var mod = require.modules[resolved];
    if (!mod) throw new Error(
        'Failed to resolve module ' + file + ', tried ' + resolved
    );
    var cached = require.cache[resolved];
    var res = cached? cached.exports : mod();
    return res;
};

require.paths = [];
require.modules = {};
require.cache = {};
require.extensions = [".js",".coffee",".json"];

require._core = {
    'assert': true,
    'events': true,
    'fs': true,
    'path': true,
    'vm': true
};

require.resolve = (function () {
    return function (x, cwd) {
        if (!cwd) cwd = '/';
        
        if (require._core[x]) return x;
        var path = require.modules.path();
        cwd = path.resolve('/', cwd);
        var y = cwd || '/';
        
        if (x.match(/^(?:\.\.?\/|\/)/)) {
            var m = loadAsFileSync(path.resolve(y, x))
                || loadAsDirectorySync(path.resolve(y, x));
            if (m) return m;
        }
        
        var n = loadNodeModulesSync(x, y);
        if (n) return n;
        
        throw new Error("Cannot find module '" + x + "'");
        
        function loadAsFileSync (x) {
            x = path.normalize(x);
            if (require.modules[x]) {
                return x;
            }
            
            for (var i = 0; i < require.extensions.length; i++) {
                var ext = require.extensions[i];
                if (require.modules[x + ext]) return x + ext;
            }
        }
        
        function loadAsDirectorySync (x) {
            x = x.replace(/\/+$/, '');
            var pkgfile = path.normalize(x + '/package.json');
            if (require.modules[pkgfile]) {
                var pkg = require.modules[pkgfile]();
                var b = pkg.browserify;
                if (typeof b === 'object' && b.main) {
                    var m = loadAsFileSync(path.resolve(x, b.main));
                    if (m) return m;
                }
                else if (typeof b === 'string') {
                    var m = loadAsFileSync(path.resolve(x, b));
                    if (m) return m;
                }
                else if (pkg.main) {
                    var m = loadAsFileSync(path.resolve(x, pkg.main));
                    if (m) return m;
                }
            }
            
            return loadAsFileSync(x + '/index');
        }
        
        function loadNodeModulesSync (x, start) {
            var dirs = nodeModulesPathsSync(start);
            for (var i = 0; i < dirs.length; i++) {
                var dir = dirs[i];
                var m = loadAsFileSync(dir + '/' + x);
                if (m) return m;
                var n = loadAsDirectorySync(dir + '/' + x);
                if (n) return n;
            }
            
            var m = loadAsFileSync(x);
            if (m) return m;
        }
        
        function nodeModulesPathsSync (start) {
            var parts;
            if (start === '/') parts = [ '' ];
            else parts = path.normalize(start).split('/');
            
            var dirs = [];
            for (var i = parts.length - 1; i >= 0; i--) {
                if (parts[i] === 'node_modules') continue;
                var dir = parts.slice(0, i + 1).join('/') + '/node_modules';
                dirs.push(dir);
            }
            
            return dirs;
        }
    };
})();

require.alias = function (from, to) {
    var path = require.modules.path();
    var res = null;
    try {
        res = require.resolve(from + '/package.json', '/');
    }
    catch (err) {
        res = require.resolve(from, '/');
    }
    var basedir = path.dirname(res);
    
    var keys = (Object.keys || function (obj) {
        var res = [];
        for (var key in obj) res.push(key);
        return res;
    })(require.modules);
    
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key.slice(0, basedir.length + 1) === basedir + '/') {
            var f = key.slice(basedir.length);
            require.modules[to + f] = require.modules[basedir + f];
        }
        else if (key === basedir) {
            require.modules[to] = require.modules[basedir];
        }
    }
};

(function () {
    var process = {};
    var global = typeof window !== 'undefined' ? window : {};
    var definedProcess = false;
    
    require.define = function (filename, fn) {
        if (!definedProcess && require.modules.__browserify_process) {
            process = require.modules.__browserify_process();
            definedProcess = true;
        }
        
        var dirname = require._core[filename]
            ? ''
            : require.modules.path().dirname(filename)
        ;
        
        var require_ = function (file) {
            var requiredModule = require(file, dirname);
            var cached = require.cache[require.resolve(file, dirname)];

            if (cached && cached.parent === null) {
                cached.parent = module_;
            }

            return requiredModule;
        };
        require_.resolve = function (name) {
            return require.resolve(name, dirname);
        };
        require_.modules = require.modules;
        require_.define = require.define;
        require_.cache = require.cache;
        var module_ = {
            id : filename,
            filename: filename,
            exports : {},
            loaded : false,
            parent: null
        };
        
        require.modules[filename] = function () {
            require.cache[filename] = module_;
            fn.call(
                module_.exports,
                require_,
                module_,
                module_.exports,
                dirname,
                filename,
                process,
                global
            );
            module_.loaded = true;
            return module_.exports;
        };
    };
})();


require.define("path",function(require,module,exports,__dirname,__filename,process,global){function filter (xs, fn) {
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (fn(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  var isWindows = false;
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};

});

require.define("__browserify_process",function(require,module,exports,__dirname,__filename,process,global){var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
        && window.setImmediate;
    var canPost = typeof window !== 'undefined'
        && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'browserify-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('browserify-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    if (name === 'evals') return (require)('vm')
    else throw new Error('No such module. (Possibly not yet loaded)')
};

(function () {
    var cwd = '/';
    var path;
    process.cwd = function () { return cwd };
    process.chdir = function (dir) {
        if (!path) path = require('path');
        cwd = path.resolve(dir, cwd);
    };
})();

});

require.define("Utils",function(require,module,exports,__dirname,__filename,process,global){var Utils = function() {

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
    ctx2.canvas.width = 1024;
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
    ctx.drawImage(tester, 1024, 4096);
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
      state.worker.postMessage({ "block": { "width":width, "height":height}});
    }
  };


  this.engine = fns.setupEngine();
  var that = this;
  return fns;
};

exports = module.exports = Utils;

});

require.define("Periodic",function(require,module,exports,__dirname,__filename,process,global){var Periodic = function( opts ) {
    console.log("Periodic : " + JSON.stringify(opts));
    var args = (opts != null) ? _.cloneDeep(opts) : {};

    var state =  {
       id : null,
       interval : args.interval || 500, 
       cb : args.cb || function() {},
       count : args.count || 0,
       execCount : 0,
    };
    
    function init( args ) {
        console.log("INIT - Periodic : " + JSON.stringify(opts));
        //if there is an existing id / interval, stop it.
        if ( state.id ) {
            console.log("init : stopping previous invocation");
            fns.stop();
        } else {
            state = _.cloneDeep(args);
            state.execCount = 0;
            state.id = null;
        }
    };

    var fns = {
        init : init,
        stop : function() {
            console.log("Clear " + state.id )
            if ( state.id ) {
                clearInterval(state.id);
                state.id = null;
            }
        },
        start : function() {
            console.log("start " + state.id + " execCOUNT " + state.execCount + " args.count " + args.count);
            if ( state.cb ) {
                console.log("start - getting to setInterval");
                state.id = setInterval(function() {
                    //user specifies a count - drop out if we hit it
                    if ( args.count > 0 && state.execCount >= args.count ) {
                        console.log("STOPPING - count reached");
                        fns.stop();
                        return;
                    }

                    console.log("interval " + ++state.execCount);
                    state.cb(null, state);
                }, state.interval);
            }
        },
        running: function() {
            return state.id != null;
        },
        id: function() {
            return state.id;
        },
        isPeriodic : function() {
            return true;
        }
    };

    // ---- //
    if ( opts ) {
        init(opts);
    } 

    return fns;
};

exports = module.exports = Periodic;
});

require.define("Runner",function(require,module,exports,__dirname,__filename,process,global){module.exports = function() {
	var Periodic = require('./Periodic');
	console.log("Runner ");
	var that = this;
	that.state = {
		tasks : []
	}

	this.fns = {
		add: function( task ) {
			if ( task.isPeriodic && task.isPeriodic() ) { 
				console.log("Add " + task.id() +  " : isPeridic ? " + task.isPeriodic());
				console.log("added to tasks list");
				that.state.tasks.push(task);
			}
		},
		startall : function() {
			console.log("Startall : " + that.state.tasks.length + " tasks");
			that.state.tasks.forEach(function(task) {
				console.log("")
				if ( ! task.running() ) {
					task.start();
				}
			});
		},
		stopall : function() {
			console.log("Stopall");
			that.state.tasks.forEach(function(task) {
				if ( task.running() ) {
					task.stop();
				}
			});
		},
		start : function( id ) {
			console.log("Start id : " + id);
			that.state.tasks.forEach(function(task) {
				if ( task.id() === id && ! task.running() ) {
					task.start();
				}
			});
		},
		stop : function( id ) {
			console.log("Stop id : " + id);
			that.state.tasks.forEach(function(task) {
				if ( task.id() === id &&  task.running() ) {
					task.stop();
				}
			});
		},

	};

	return this.fns;
};
});
