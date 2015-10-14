var AppDispatcher = require('../dispatcher/Dispatcher')
var ActionTypes = require('../enums/ActionTypes')

var FvizActions = {
  updateProps: function (data) {
    console.log('UpdateProps ' + JSON.stringify(data))
    AppDispatcher.handleAction({
      actionType: ActionTypes.PROPS_UPDATED,
      data: data
    })
  }
}

module.exports = FvizActions
