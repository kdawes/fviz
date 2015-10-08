var React = require('react')
var PureRenderMixin = require('react/addons').addons.PureRenderMixin
var dispatcher = require('../Dispatcher')

var LeftProps = React.createClass({
  mixins: [PureRenderMixin],
  componentDidMount: function () {
    setTimeout(function () {
      dispatcher.dispatch({ 'actionType': 'props-updated',
        'newProps': { 'width': 8, 'height': 8, 'spanw': 512, 'grid': true }
      })
    }.bind(this), 10000)
  },
  render: function () {
    console.log('leftprops - dispatching action')
    return (<h3>:D</h3>)
  }
})

exports = module.exports = LeftProps
