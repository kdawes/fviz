var director = require('director')
var React = require('react')
var _ = require('lodash')
var fd = require('../Dispatcher')

// need to require css or browserify doesn't pull in the bootstrap stuff
var css = require('../../css/app.css')
// console.log('CSS yo', css)

var PluginDispatcher = require('../PluginDispatcher')
var pluginEngine = new PluginDispatcher()
var Slate = require('./Slate')
var NavPills = require('./NavPills')
var LeftPropsWidget = require('./LeftProps')
var Utils = require('../Utils')
var u = new Utils()

var App = React.createClass({
  shannon: function () {
    var cfgTmp = _.cloneDeep(this.state.config)
    cfgTmp.engine.blksz = 64
    cfgTmp.engine.type = 'shannon'
    this.setState({'config': cfgTmp})
  },
  filter: function () {
    var cfgTmp = _.cloneDeep(this.state.config)
    cfgTmp.engine.type = 'filter'
    this.setState({'config': cfgTmp})
  },
  raw: function () {
    var cfgTmp = _.cloneDeep(this.state.config)
    cfgTmp.engine.type = 'raw'
    this.setState({'config': cfgTmp})
  },
  getDefaultProps: function () { console.log('getDefaultProps fired'); return { another: true }; },
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

  componentDidMount: function () {
    console.log('componentDidMount fired with state.config : ' + JSON.stringify(this.state.config.engine, null, 2))
    console.log('registering with the FluxDispatcher')

    this.state.router.init()
    u.getBytes(this.state.config.engine.dataUrl, function doIt (e, r) {
      if (e) throw new Error('failed data fetch')
      this.setState({data: r})
    }.bind(this))

    fd.dispatch({ 'actionType': 'dispatcher-online'})

    fd.register(function (d) {
      console.log('got a fd action ' + JSON.stringify(d))
      // XXX Fixme this needs an abstraction layer and
      // sanitization
      var cfgTmp = _.cloneDeep(this.state.config)
      cfgTmp.width = d.newProps.width || cfgTmp.width
      cfgTmp.height = d.newProps.height || cfgTmp.height
      cfgTmp.spanw = d.newProps.spanw || cfgTmp.spanw
      cfgTmp.grid = d.newProps.grid || cfgTmp.grid

      console.log('setting state.config : ' + JSON.stringify(cfgTmp, null, 2))
      this.setState({'config': cfgTmp})
    }.bind(this))
  },
  shouldComponentUpdate: function () { console.log('shouldComponentUpdate fired'); return true; },
  // componentWillUpdate: function () { console.log('componentWillUpdate fired'); },
  // componentDidUpdate: function () { console.log('componentDidUpdate fired'); },
  // componentWillUnmount: function () { console.log('componentWillUnmount fired'); },
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
