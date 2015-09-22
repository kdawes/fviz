var Proc = require('./Proc')
var engine = new Proc()
var director = require('director')

var routes = {
  '/filter': filter,
  '/shannon': shannonRouteHandler,
  '/raw': raw,
  '/list': list,
  '/': list
}

var config = {
  'engine': {
  },
  'width': 6,
  'height': 6,
  'spanw': 1024,
  'spanh': 2048,
  'grid': false
}

function shannonRouteHandler () {
  console.log('SHannon route')
  var cfg = _.cloneDeep(config)
  cfg.engine.blksz = 64
  cfg.width = 6
  cfg.height = 6
  cfg.grid = true
  cfg.engine.type = 'shannon'
  engine.run(cfg)
}

function filter () {
  console.log('Filter route')
  var cfg = _.cloneDeep(config)
  cfg.engine.type = 'filter'
  cfg.width = 6
  cfg.height = 6
  cfg.grid = true
  engine.run(cfg)
}

function raw () {
  console.log('raw route')
  var cfg = _.cloneDeep(config)
  cfg.engine.type = 'raw'
  cfg.grid = true
  cfg.width = 6
  cfg.height = 6
  engine.run(cfg)
}

function list () {
  $().ready(function () {
    $('#msgs').empty()
    Object.keys(routes).forEach(function (r) {
      var ctnt = '<a href=/#' + r + '>' + r + '</a>'
      console.log('LIST :> ' + ctnt)
      $('#msgs').append(ctnt + ' </br>')
    })
  })
}

var router = new director.Router(routes)
router.init()
