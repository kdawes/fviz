var AppDispatcher = require('../dispatcher/Dispatcher')
var ActionTypes = require('../enums/ActionTypes')
var EventEmitter = require('events').EventEmitter
var _ = require('lodash')
var Utils = require('../Utils')
var config = {}
var routes = {
  '/filter': filter,
  '/shannon': shannon,
  '/raw': raw
}
var config = {
  'engine': {
    'dataUrl': '/img'
  },
  'width': 16,
  'height': 16,
  'spanw': 1024, // should be a multiple of width
  'grid': true,
  'routes': Object.keys(routes)
}

function shannon () {
  config.engine.blksz = 64
  config.engine.type = 'shannon'
  ConfigStore.emitChange()
}

function filter () {
  config.engine.type = 'filter'
  ConfigStore.emitChange()
}

function raw () {
  config.engine.type = 'raw'
  ConfigStore.emitChange()
}

var ConfigStore = _.extend({}, EventEmitter.prototype, {
  get: function () {
    return {
      config: _.extend({}, config),
      routes: _.extend({}, routes)
    }
  },
  emitChange: function () {
    console.log('emitChange config')
    this.emit('change')
  },
  addChangeListener: function (callback) {
    this.on('change', callback)
  },
  removeChangeListener: function (callback) {
    this.removeListener('change', callback)
  }
})

function onPropsChange (d) {
  console.log('onPropsChange ' + JSON.stringify(d, null, 2))
  if (d.action.actionType === ActionTypes.PROPS_UPDATED) {
    config.width = d.action.data.width || config.width
    config.height = d.action.data.height || config.height
    config.spanw = d.action.data.spanw || config.spanw
    config.grid = d.action.data.grid || config.grid

    ConfigStore.emitChange()
  }
}

AppDispatcher.register(onPropsChange)

exports = module.exports = ConfigStore
