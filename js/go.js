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
  'spanw': 2048,
  'spanh': 2048,
  'grid': false
}

function shannonRouteHandler () {
  console.log('SHannon route')
  var cfg = _.cloneDeep(config)
  cfg.engine.blksz = 20
  cfg.width = 4
  cfg.height = 4
  cfg.grid = true
  cfg.engine.type = 'shannon'
  engine.go(cfg)
}

function filter () {
  console.log('Filter route')
  var cfg = _.cloneDeep(config)
  cfg.engine.type = 'filter'
  cfg.width = 6
  cfg.height = 6
  cfg.grid = true
  engine.go(cfg)
}

function raw () {
  console.log('raw route')
  var cfg = _.cloneDeep(config)
  cfg.engine.type = 'raw'
  cfg.grid = true
  engine.go(cfg)
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
