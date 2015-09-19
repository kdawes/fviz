function Shannon () {
  function getBytes (cb) {
    console.log('getBytes')
    var xhr = new XMLHttpRequest()

    xhr.open('GET', '/img', true)
    xhr.responseType = 'arraybuffer'
    xhr.onload = function (e) {
      console.log('XHR load')
      var words = new Uint8Array(this.response)
      console.log('WE GOT ' + words.length)
      cb(null, words)
    }
    console.log('XHR SEND')
    xhr.send()
  }

  function historize (bytes_data) {
    var bb = {}
    for (var i = 0; i < bytes_data.length; i++) {
      bb[bytes_data[i]] = bb[bytes_data[i]]++ || 1
    }
    return bb
  }

  function log2 (x) {
    return Math.log(x) / Math.log(2)
  }

  function pluginFilter (opts) {
    var ctx = opts.ctx
    var blocks = []
    var raw = opts.data
    var re = /[\x20-\x7E]/
    for (var i = 0; i < raw.length; i++) {
      var y = Math.floor(i * ctx.block.width / ctx.spanw)
      var xx = (i * ctx.block.width) % ctx.spanw
      var yy = (y * ctx.block.height)

      if (raw[i] === 0xff) {
        blocks.push({
          'raw': raw[i],
          'rgba': { 'r': 255, 'g': 0, 'b': 0, 'a': 255 },
          'x': xx,
          'y': yy
        })
      } else if (raw[i] === 0x0) {
        blocks.push({
          'raw': raw[i],
          'rgba': { 'r': 0, 'g': 255, 'b': 0, 'a': 255 },
          'x': xx,
          'y': yy
        })
      } else if (re.test(raw[i])) {
        blocks.push({
          'raw': raw[i],
          'rgba': { 'r': 0, 'g': 0, 'b': 255, 'a': 255 },
          'x': xx,
          'y': yy
        })
      } else {
        blocks.push({
          'raw': raw[i],
          'rgba': { 'r': 255, 'g': 255, 'b': 255, 'a': 255 },
          'x': xx,
          'y': yy
        })
      }
    }
    return blocks
  }

  function pluginShannon (opts) {
    var blocks = []
    var ctx = opts.ctx
    var tmp = fns.chunked_shannon(opts)
    for (var i = 0; i < tmp.length; i++) {
      var y = Math.floor(i * ctx.block.width / ctx.spanw)
      var xx = (i * ctx.block.width) % ctx.spanw
      var yy = (y * ctx.block.height)
      blocks.push({
        'raw': tmp[i],
        'rgba': {
          'r': tmp[i] * 1.095,
          'g': 0,
          'b': 0,
          'a': tmp[i] << 1.75
        },
        'x': xx,
        'y': yy
      })
    }
    return blocks
  }

  function pluginRaw (opts) {
    var blocks = []

    return blocks
  }

  // exported functions
  var fns = {
    normalize: function (data) {
      // x = x - xmin / xmax - xmin =>  ( ( x - 0 ) / 255 - 0) * 255
      var n = new Uint8Array(data.length)
      for (var i = 0; i < data.length; i++) {
        n[i] = (data[i] - 1) / (255 - 1) * 255
      }
      return n
    },
    shannon: function (bytes) {
      // var sums = 0
      // Object.keys(bytes).forEach(function (k) {
      //   var p = pct(k); sums += p * log2(p)
      // })
      // console.log('Shannon entropy ' + -1 * sums)
    },
    chunked_shannon: function (opts) {
      console.log('CHUNKED SHANNON ' + JSON.stringify(opts.ctx))
      var r = []
      var sz = opts.ctx.engine.blksz
      var raw = opts.data
      var left = raw.length
      var idx = 0
      var count = 0
      var chunk_size = (undefined === sz) ? 20 : sz

      do {
        var sums = 0
        var n = (left >= chunk_size) ? chunk_size : left
        var chunk = raw.subarray(idx, idx + n)
        var hist = historize(chunk)
        Object.keys(hist).forEach(function (k) {
          var p = hist[k] / chunk.length
          sums += p * log2(p)
        })
        //	console.log (count + ' : ' + -1 * sums)
        r.push(-idx * sums)
        left -= n
        idx += n
        count++
      } while (left > 0)
      return r
    },
    buildIt: function (ctx, cb) {
      console.log('buildIt ' + JSON.stringify(ctx))
      if (ctx === null) {
        console.log('Null context - returning')
        return
      }
      getBytes(function (e, r) {
        if (e !== null) {
          console.log('ERROR ' + e)
          return cb(e, null)
        }
        console.log('ENGINE ' + ctx.engine)
        switch (ctx.engine.type) {
          case 'shannon':
          return cb(null,
            pluginShannon({
              'data': fns.normalize(r),
              'ctx': ctx
            })
          )
          break
          case 'filter':
          return cb(null,
            pluginFilter({
              'data': r,
              'ctx': ctx
            })
          )
          break
          case 'raw':
          return cb(null,
            pluginRaw({
              'data': r,
              'ctx': ctx
            })
          )
          break
        }
      })
    }
  }

  return fns
}
// Onmessage for webworker support
onmessage = function (oev) {
  var LIMIT_DATA = 1000000
  if (oev.data) {
    console.log('TYPEOF ' + oev.data)
    console.log('Shannon worker onmessage handler : BLOCK ' + JSON.stringify(oev.data))
    var p = new Shannon()
    p.buildIt(oev.data, function (e, r) {
      if (e) { console.log('ERROR ' + e); return }
      console.log('Got bytes : ' + r.length)
      var intervalId = setInterval(function () {
        console.log('1234 postMessage with bytes.length : ' + r.length)
        postMessage(JSON.stringify(r.splice(0, LIMIT_DATA)))
        // console.log ('bytes.length ' + results.length)
        if (r.length === 0) {
          console.log('CLEARING webworker interval - data is done')
          clearInterval(intervalId)
          postMessage(null)
        }
      }, 500)
    })
  }
}
