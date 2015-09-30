var React = require('react')

var Slate = React.createClass({
  render : function () {
    var d = this.props.data
    var calculatedHeight = Math.floor(d.blocks.length * d.width / d.spanw) * d.height
    console.log('spanw'+ d.spanw+ ' bw '+ d.bw+ ' length '+ d.blocks.length)
    console.log("calculated height " + calculatedHeight)

    return (

      <div>

      <button type="button" class="btn btn-default" aria-label="Left Align">
      <span class="glyphicon glyphicon-align-left" aria-hidden="true"></span>
      </button>

      <button type="button" class="btn btn-default btn-lg">
      <span class="glyphicon glyphicon-star" aria-hidden="true"></span> Star
      </button>



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
