var log = console.log.bind(console, 'DBG>')

function Utils () {
  if (!(this instanceof Utils)) {
    return new Utils()
  }
}

Utils.prototype.log2 = function (x) {
  return Math.log(x) / Math.log(2)
}

Utils.prototype.historize = function (bytes_data) {
  var bb = {}
  for (var i = 0; i < bytes_data.length; i++) {
    bb[bytes_data[i]] = ++bb[bytes_data[i]] || 1
  }
  return bb
}
Utils.prototype.normalize = function (data) {
  // x = x - xmin / xmax - xmin =>  ( ( x - 0 ) / 255 - 0) * 255
  var n = new Uint8Array(data.length)
  for (var i = 0; i < data.length; i++) {
    n[i] = (data[i] - 1) / (255 - 1) * 255
  }
  return n
}

Utils.prototype.fillBlock = function (context, w, h, blk) {
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

Utils.prototype.getBytes = function (url, cb) {
  if (!url) throw new Error('getBytes(url,cb) - url is required')
  log('getBytes', ' url ', url)
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'arraybuffer'
  xhr.onload = function (e) {
    console.log('XHR load')
    var words = new Uint8Array(this.response)
    log('WE GOT ', words.length)
    cb(null, words)
  }
  log('XHR SEND')
  xhr.send()
}

exports = module.exports = new Utils()
