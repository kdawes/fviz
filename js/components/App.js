'use strict'

var director = require('director')
var React = require('react')
var _ = require('lodash')

// need to require css or browserify doesn't pull in the bootstrap stuff
var css = require('../../css/app.css')

// Application Plubming
var PluginDispatcher = require('../PluginDispatcher')
var pluginEngine = new PluginDispatcher()
var AppDispatcher = require('../dispatcher/Dispatcher')
// Custom Components
var Slate = require('./Slate')
var NavPills = require('./NavPills')
var LeftPropsWidget = require('./LeftProps')
// Stores / enums
var ActionTypes = require('../enums/ActionTypes')
var UrlDataStore = require('../stores/UrlDataStore')
var ConfigStore = require('../stores/ConfigStore')

var App = React.createClass({
  _onChange: function () {
    console.log('_onChange')
    var config = ConfigStore.get().config
    this.setState({config: config})
  },
  getInitialState: function () {
    console.log('getInitialState fired')
    var config = ConfigStore.get()
    var router = new director.Router(config.routes).configure({})

    return {'routes': config.routes, 'config': config.config, 'router': router }
  },
  componentDidMount: function () {
    this.state.router.init()
    UrlDataStore.init(this.state.config.engine.dataUrl)
    ConfigStore.addChangeListener(this._onChange)
    UrlDataStore.addChangeListener(this._onChange)
  },
  componentWillUpdate: function (nextProps, nextState) {
    console.log('componentWillUpdate fired')
  },
  componentDidUpdate: function (prevProps, prevState) {
    console.log('componentDidUpdate fired')
  },
  componentWillUnmount: function () {
    console.log('componentWillUnmount fired')
    ConfigStore.removeChangeListener(this._onChange)
    UrlDataStore.removeChangeListener(this._onChange)
  },
  render: function () {
    var cs = ConfigStore.get()
    var data = UrlDataStore.get(cs.config.engine.dataUrl)
    if (data) {
      var blocks = pluginEngine.run(cs.config, data)
      return (
      <div className={'container-fluid'}>
          <div className={'col-md-2'}>
            <LeftPropsWidget/>
          </div>
          <div className={'col-md-10'}>
            <NavPills router={this.state.router} routes={cs.config.routes}/>
            <Slate blocks={blocks} config={cs.config}/>
          </div>
        </div>
      )
    } else { return ( <h1>loading...</h1>)}
  }
})

exports = module.exports = App
