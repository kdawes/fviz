'use strict'
var React = require('react')
var PureRenderMixin = require('react/addons').addons.PureRenderMixin
var dispatcher = require('../Dispatcher')

var LeftProps = React.createClass({
  mixins: [PureRenderMixin],
  haveComms: function () {
    return this.state.comms
  },
  getInitialState: function () {
    return { 'comms': false, 'commsIntervalId': null }
  },
  componentDidMount: function () {
    console.log('leftprops - componentDidMOunt')
    var that = this
    let commsIntervalId = setInterval(function () {
      if (that.haveComms()) {
        console.log('leftprops - dispatching action')
        dispatcher.dispatch({ 'actionType': 'props-updated',
          'newProps': { 'width': 8, 'height': 8, 'spanw': 512, 'grid': true }
        })
        console.log('Clearning commsIntervalId')
        clearInterval(that.state.commsIntervalId)
      } else {
        console.log('no comms : ' + that.state.commsIntervalId)
      }
    }, 1000)
    this.setState({'commsIntervalId': commsIntervalId})

    dispatcher.register(function (d) {
      if (d.actionType && d.actionType === 'dispatcher-online') {
        that.setState({'comms': true})
      } else {
        console.log('Unknown action from dispatcher' + JSON.stringify(d))
      }
    })

  },
  render: function () {
    return (<h3>:D</h3>)
  }
})

exports = module.exports = LeftProps
