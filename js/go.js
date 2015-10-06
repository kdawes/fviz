var director = require('director')
var React = require('react')
var Alert = require('react-bootstrap').Alert

var NavPills = require('./NavPills')
var Dispatcher = require('./Dispatcher')
var engine = new Dispatcher()
// need to require css or browserify doesn't pull in the bootstrap stuff
var css = require('../css/app.css')
// console.log('CSS yo', css)

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

function drawUi (config) {
  engine.run(config, function (e, data) {
    React.render(<NavPills router={router} routes={config.routes}/>, document.getElementById('routes'))
    React.render(data, document.getElementById('messages'))
  })
}

function shannon () {
  config.engine.blksz = 64
  config.engine.type = 'shannon'
  drawUi(config)
}

function filter () {
  config.engine.type = 'filter'
  drawUi(config)
}

function raw () {
  config.engine.type = 'raw'
  drawUi(config)
}

var router = new director.Router(routes).configure({notfound: filter})
router.init()
