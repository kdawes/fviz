var React = require('react')
var Nav = require('react-bootstrap').Nav
var NavItem = require('react-bootstrap').NavItem
var PureRenderMixin = require('react/addons').addons.PureRenderMixin

var NavPillRoutes = React.createClass({
  mixins: [PureRenderMixin],
  handleSelect: function (selectedKey) {
    this.setState({activeTab: selectedKey})
    this.props.router.setRoute(this.props.routes[selectedKey - 1])
  },
  getInitialState: function () {
    // figure out which route this is and make that NavPill active
    var route = ['/', this.props.router.getRoute()].join('')
    var idx = this.props.routes.indexOf(route) + 1
    var active = (idx > 0) ? idx : 1
    return { activeTab: active }
  },
  render: function () {
    var i = 0
    var routeList = this.props.routes.map(function (r) {
      return <NavItem  eventKey={++i} key={i} href={'/#' + r}>{r}</NavItem>
    })
    var idx = this.getInitialState().activeTab
    return (
    <Nav bsStyle='pills' onSelect={this.handleSelect} activeKey={idx} >
      {routeList}
    </Nav>
    )
  }
})

module.exports = NavPillRoutes
