var $ = require('jquery')
var director = require('director')
var React = require('react')
var Alert = require('react-bootstrap').Alert;

var Engine = require('./Engine')
var engine = new Engine()

var css = require('../css/app.css')
console.log('CSS yo', css)

var routes = {
  '/filter': filter,
  '/shannon': shannonRouteHandler,
  '/raw': raw,
  '/': listRoutes
}

var config = {
  'engine': {
  },
  'width': 	12,
  'height': 12,
  'spanw': 768,
  'grid': true
}

var Url = React.createClass({
  render : function () {
    var joined = "/#" + this.props.url
    return (<div><a href={joined} > {this.props.name}</a><br/></div>)
  }
})

var UrlList = React.createClass({
  render: function() {
    var i = 0
    var ul = this.props.urls.map(function(r) {
      return <Url key={++i} name={r} url={r}/>
    })
    return (<div>{ul}</div>)
  }
})

function shannonRouteHandler () {
  var cfg = $.extend(true, {}, config);
  cfg.engine.blksz = 64
  cfg.engine.type = 'shannon'

  engine.run(cfg, function(e, shard) {
    React.render(<UrlList urls={Object.keys(routes)}/>, document.getElementById('routes'))
    React.render(shard, document.getElementById('messages'))
  })
}

function filter () {
  var cfg = $.extend(true, {}, config);
  cfg.engine.type = 'filter'

  engine.run(cfg, function(e, shard) {
    React.render(<Alert title='test'/>, document.getElementById('test'))
    React.render(<UrlList urls={Object.keys(routes)}/>, document.getElementById('routes'))
    React.render(shard, document.getElementById('messages'))
  })
}

function raw () {
  var cfg = $.extend(true, {}, config);
  cfg.engine.type = 'raw'

  engine.run(cfg, function(e, shard) {
    React.render(<UrlList urls={Object.keys(routes)}/>, document.getElementById('routes'))
    React.render(shard, document.getElementById('messages'))
  })
}

function listRoutes() {
  React.render(<UrlList urls={Object.keys(routes)}/>, document.getElementById('routes'))
}

//
var router = new director.Router(routes)
router.init()
listRoutes()
