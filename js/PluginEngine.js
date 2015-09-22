var PluginRaw = require('./PluginRaw')
var PluginShannon = require('./PluginShannon')
var PluginFilterByType = require('./PluginFilterByType')

function PluginEngine () {
  if (!(this instanceof PluginEngine)) {
    return new PluginEngine()
  }
  var self = this

  this.run = function (opts) {
    self.plugin = (function () {
      if (opts.engine && opts.engine.type) {
        switch (opts.engine.type) {
          case 'raw':
            return new PluginRaw()
            break
          case 'filter':
            return new PluginFilterByType()
            break
          case 'shannon':
            return new PluginShannon()
            break
          default:
            throw new Error('unsupported plugin')
        }
      } else {
        throw new Error('no engine or engine not supported')
      }
    })()
    return self.plugin.run(opts)
  }
}

exports = module.exports = PluginEngine
