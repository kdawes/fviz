var director = require('director')
var React = require('react')
var _ = require('lodash')

var Slate = require('./Slate')
var NavPills = require('./NavPills')
var FluxDispatcher = require('flux').Dispatcher
var fd = new FluxDispatcher()
var Dispatcher = require('./Dispatcher')
var engine = new Dispatcher()
// need to require css or browserify doesn't pull in the bootstrap stuff
var css = require('../css/app.css')
// console.log('CSS yo', css)
var PureRenderMixin = require('react/addons').addons.PureRenderMixin

var LeftPropsMenuWidget = React.createClass({
  mixins: [PureRenderMixin],
  componentDidMount: function () {
    setTimeout(function () {
      fd.dispatch({ 'actionType': 'props-updated',
        'newProps': { 'width': 8, 'height': 8, 'spanw': 512, 'grid': true }
      })

    }, 10000)
  },
  render: function () {
    console.log('leftprops - dispatching action')
    return (<h3>:D</h3>)
  }
})

var App = React.createClass({
  getDefaultProps: function () { console.log('getDefaultProps fired'); return { another: true }; },
  getInitialState: function () {
    console.log('getInitialState fired')
    var routes = {
      '/filter': filter,
      '/shannon': shannon,
      '/raw': raw
    }
    return {'routes': routes, 'config': config}
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
    var that = this
    fd.register(function (d) {
      console.log('got a fd action ' + JSON.stringify(d))
      // XXX Fixme this needs an abstraction layer and
      // sanitization
      var cfgTmp = _.cloneDeep(that.state.config)
      cfgTmp.width = d.newProps.width || cfgTmp.width
      cfgTmp.height = d.newProps.height || cfgTmp.height
      cfgTmp.spanw = d.newProps.spanw || cfgTmp.spanw
      cfgTmp.grid = d.newProps.grid || cfgTmp.grid
      console.log('setting state.config : ' + JSON.stringify(cfgTmp, null, 2))
      that.setState({'config': cfgTmp})
    })
  },
  // shouldComponentUpdate: function () { console.log('shouldComponentUpdate fired'); return true; },
  // componentWillUpdate: function () { console.log('componentWillUpdate fired'); },
  // componentDidUpdate: function () { console.log('componentDidUpdate fired'); },
  // componentWillUnmount: function () { console.log('componentWillUnmount fired'); },
  render: function () {
    var a = 0
    return (
    <div className={'container-fluid'}>
  <div className={'col-md-2'}>
    <LeftPropsMenuWidget/>
      <h3>
        width {this.state.config.width} <br/>
        height {this.state.config.height}<br/>
        spanw {this.state.config.spanw}<br/>
        grid {(this.state.config.grid) ? 'true' : 'false'}
      </h3>
  </div>
  <div className={'col-md-10'}>
    <NavPills router={router} routes={this.state.config.routes}/>
    <Slate data={this.props.blocks}/>
  </div>
</div>
    )
  }
})

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
    React.render(<App blocks={data}/>, document.getElementById('App'))
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
