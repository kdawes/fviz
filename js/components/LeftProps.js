'use strict'
var React = require('react')
var PureRenderMixin = require('react/addons').addons.PureRenderMixin
var dispatcher = require('../Dispatcher')
var ActionTypes = require('../enums/ActionTypes')

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
    var commsIntervalId = setInterval(function () {
      if (that.haveComms()) {
        console.log('leftprops - dispatching action')
        dispatcher.dispatch({ 'action': ActionTypes.props_updated,
          'data': { 'width': 8, 'height': 8, 'spanw': 512, 'grid': true }
        })
        console.log('Clearning commsIntervalId')
        clearInterval(that.state.commsIntervalId)
      } else {
        console.log('no comms : ' + that.state.commsIntervalId)
      }
    }, 1000)
    this.setState({'commsIntervalId': commsIntervalId})

    dispatcher.register(function (d) {
      if (d.action && d.action === ActionTypes.dispatcher_online) {
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
