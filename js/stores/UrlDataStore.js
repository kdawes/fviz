var EventEmitter = require('events').EventEmitter
var _ = require('lodash')
var Utils = require('../Utils')

var urls = {}

var UrlDataStore = _.extend({}, EventEmitter.prototype, {
  init: function (url, cb) {
    var callback = cb || function () {}
    if (urls[url]) { return callback(null, null) }
    Utils.getBytes(url, function fetchUrl (e, r) {
      if ( e ) return callback('Error ' + e, null)
      urls[url] = r
      this.emitChange()
      return callback(null, null)
    }.bind(this))
  },
  get: function (url) {
    return urls[url]
  },
  emitChange: function () {
    console.log('emitChange : urldatastore')
    this.emit('change')
  },
  addChangeListener: function (callback) {
    this.on('change', callback)
  },
  removeChangeListener: function (callback) {
    this.removeListener('change', callback)
  }
})

exports = module.exports = UrlDataStore
