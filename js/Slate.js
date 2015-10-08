var React = require('react')

var Slate = React.createClass({
  render: function () {
    var d = this.props.data
    var calculatedHeight = Math.floor(d.blocks.length * d.width / d.spanw) * d.height
    // console.log('calculated height ' + calculatedHeight)
    return (
    <div>
      <span>
      <h2 className={'text-muted'}> BW : {d.width} Data Size: {this.props.data.blocks.length} Span Width: {this.props.data.spanw}</h2>
      </span>
      <div>
      <svg width={this.props.data.spanw}
    height={calculatedHeight}>
      {this.props.data.blocks}
      </svg>
      </div>
      </div>
    )
  }
})

exports = module.exports = Slate
