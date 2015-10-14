var React = require('react')

var Slate = React.createClass({
  render: function () {
    var d = this.props.blocks
    var config = this.props.config
    var calculatedHeight = Math.floor(d.length * config.width / config.spanw) * config.height
    // console.log('calculated height ' + calculatedHeight)
    return (<div>
      <div></div>
    <span>
    <svg width={config.spanw}
    height={calculatedHeight}>
        {d}
      </svg>
    </span>
    </div>
    )
  }
})

exports = module.exports = Slate
