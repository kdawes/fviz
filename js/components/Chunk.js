'use strict'
var PureRenderMixin = require('react/addons').addons.PureRenderMixin

var React = require('react')
var Chunk = React.createClass({
  mixins: [PureRenderMixin],
  render: function () {
    return (
    <rect
    x={this.props.x}
    y={this.props.y}
    width={this.props.w}
    height={this.props.h}
    fill={toRgbaString(this.props.rgba)}
    />
    )
  }
})

function toRgbaString (rgba) {
  return 'rgba(' + [rgba.r, rgba.g, rgba.b, rgba.a].join(',') + ')'
}

module.exports = Chunk
