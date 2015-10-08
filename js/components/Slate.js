var React = require('react')

var Slate = React.createClass({
  render: function () {
    var d = this.props.blocks
    var config = this.props.config
    var calculatedHeight = Math.floor(d.length * config.width / config.spanw) * config.height
    // console.log('calculated height ' + calculatedHeight)
    return (
    <div>
      <span>
      <h2 className={'text-muted'}> BW : {config.width} Data Size: {d.length} Span Width: {config.spanw}</h2>
      </span>
      <div>
      <svg width={config.spanw}
    height={calculatedHeight}>
      {d}
      </svg>
      </div>
      </div>
    )
  }
})

exports = module.exports = Slate
