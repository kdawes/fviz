'use strict'
var React = require('react')
var PureRenderMixin = require('react/addons').addons.PureRenderMixin
var dispatcher = require('../dispatcher/Dispatcher')
var ActionTypes = require('../enums/ActionTypes')
var FvizActions = require('../actions/FvizActions')
var ConfigStore = require('../stores/ConfigStore')
var Input = require('react-bootstrap').Input

var LeftProps = React.createClass({
  mixins: [PureRenderMixin],
  getInitialState: function () {
    return { w: 16, h: 16, spanw: 1024, grid: true}
  },
  handleSubmit: function (e) {
    e.preventDefault()
    FvizActions.updateProps({
      'width': this.state.w,
      'height': this.state.h,
      'spanw': this.state.spanw,
      'grid': true
    })
  },
  handleChangeWidth: function (event) {
    this.setState({w: event.target.value})
  },
  handleChangeHeight: function (event) {
    this.setState({h: event.target.value})
  },
  handleChangeSpanw: function (event) {
    this.setState({spanw: event.target.value})
  },
  render: function () {
    return (<div>
    <form className="form-horizontal" onSubmit={this.handleSubmit}>
        <Input type='text' label='Width' value={this.state.w} onChange={this.handleChangeWidth}/>
        <Input type='text' label='Height' value={this.state.h} onChange={this.handleChangeHeight}/>
        <Input type='text'  label='Span' value={this.state.spanw} onChange={this.handleChangeSpanw}/>
      <input className='btn' type='submit' value='Update Props' />
      </form>
    </div>
    )
  }

})

exports = module.exports = LeftProps
