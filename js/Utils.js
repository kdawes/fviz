var log = console.log.bind(console, 'DBG>')
function Utils() {
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
    bb[bytes_data[i]] = bb[bytes_data[i]]++ || 1
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

exports = module.exports = Utils
