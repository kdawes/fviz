'use strict'

var director = require('director')
var React = require('react')
var _ = require('lodash')
var dispatcher = require('../Dispatcher')

// need to require css or browserify doesn't pull in the bootstrap stuff
var css = require('../../css/app.css')
// console.log('CSS yo', css)

// Application Plubming
var PluginDispatcher = require('../PluginDispatcher')
var pluginEngine = new PluginDispatcher()

// Custom Components
var Slate = require('./Slate')
var NavPills = require('./NavPills')
var LeftPropsWidget = require('./LeftProps')
//
var ActionTypes = require('../enums/ActionTypes')
var UrlData = require('../stores/UrlData')
var urlStore = new UrlData()

var App = React.createClass({
  // Router / Plugin function
  shannon: function () {
    var cfgTmp = _.cloneDeep(this.state.config)
    cfgTmp.engine.blksz = 64
    cfgTmp.engine.type = 'shannon'
    this.setState({'config': cfgTmp})
  }, // Router / plugin function
  filter: function () {
    var cfgTmp = _.cloneDeep(this.state.config)
    cfgTmp.engine.type = 'filter'
    this.setState({'config': cfgTmp})
  }, // Router / plugin function
  raw: function () {
    var cfgTmp = _.cloneDeep(this.state.config)
    cfgTmp.engine.type = 'raw'
    this.setState({'config': cfgTmp})
  },
  getDefaultProps: function () {
    console.log('getDefaultProps fired')
    return { }
  },
  getInitialState: function () {
    console.log('getInitialState fired')
    var routes = {
      '/filter': this.filter,
      '/shannon': this.shannon,
      '/raw': this.raw
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
    var router = new director.Router(routes).configure({notfound: this.filter})

    return {'routes': routes, 'config': config, 'router': router }
  },
  componentWillMount: function () {
    console.log('componentWillMount')
  },
  componentWillReceiveProps: function (props) {
    // console.log('componentWillReceiveProps >' + JSON.stringify(props))
  },
  mergeUpdatedProps: function (d) {
    if (d.action === ActionTypes.props_updated) {
      // console.log('got a fd action ' + JSON.stringify(d))
      // XXX Fixme this needs an abstraction layer and
      // sanitization
      var cfgTmp = _.cloneDeep(this.state.config)
      cfgTmp.width = d.data.width || cfgTmp.width
      cfgTmp.height = d.data.height || cfgTmp.height
      cfgTmp.spanw = d.data.spanw || cfgTmp.spanw
      cfgTmp.grid = d.data.grid || cfgTmp.grid

      this.setState({'config': cfgTmp})
    }
  },
  componentDidMount: function () {
    this.state.router.init()
    urlStore.init(this.state.config.engine.dataUrl, function (e, r) {
      if (e) throw new Error(e)
      var data = urlStore.get(this.state.config.engine.dataUrl)
      console.log('we got data' + data)
      this.setState({'data': data})
    }.bind(this))

    dispatcher.register(this.mergeUpdatedProps)

    var intervalId = setInterval(function () {
      console.log('dispatch online')
      dispatcher.dispatch({'action': ActionTypes.dispatcher_online})
    }, 1000)
    this.setState({'invtervalId': intervalId})
  },
  shouldComponentUpdate: function (nextProps, nextState) {
    console.log('shouldComponentUpdate fired')
    return true
  },
  componentWillUpdate: function (nextProps, nextState) {
    console.log('componentWillUpdate fired')
  },
  componentDidUpdate: function (prevProps, prevState) {
    console.log('componentDidUpdate fired')
  },
  componentWillUnmount: function () {
    console.log('componentWillUnmount fired')
    clearInterval(this.state.intervalId)
  },
  render: function () {
    if (this.state.data) {
      var blocks = pluginEngine.run(this.state.config, this.state.data)
      return (
      <div className={'container-fluid'}>
          <div className={'col-md-2'}>
            <LeftPropsWidget/>
            <h3>
              width {this.state.config.width} <br/>
            height {this.state.config.height}<br/>
          spanw {this.state.config.spanw}<br/>
        grid {(this.state.config.grid) ? 'true' : 'false'}
      </h3>
    </div>
    <div className={'col-md-10'}>
      <NavPills router={this.state.router} routes={this.state.config.routes}/>
      <Slate blocks={blocks} config={this.state.config}/>
    </div>
    </div>
      )
    } else { return ( <h1>loading...</h1>)}
  }
})

exports = module.exports = App
