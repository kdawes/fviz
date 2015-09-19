module.exports = function() {
  var Periodic = require('Periodic')

  console.log("Runner ")
  var that = this
  that.state = {
    tasks : []
  }

  this.fns = {
    add: function ( task ) {
      if  ( task.isPeriodic && task.isPeriodic () ) {
        console.log ("Add " + task.id () +  " : isPeridic ? " + task.isPeriodic ())
        console.log ("added to tasks list")
        that.state.tasks.push (task)
      }
    },
    startall : function () {
      console.log ("Startall : " + that.state.tasks.length + " tasks")
      that.state.tasks.forEach (function (task) {
        console.log ("")
        if  ( ! task.running () ) {
          task.start ()
        }
      })
    },
    stopall : function () {
      console.log ("Stopall")
      that.state.tasks.forEach (function (task) {
        if  ( task.running () ) {
          task.stop ()
        }
      })
    },
    start : function ( id ) {
      console.log ("Start id : " + id)
      that.state.tasks.forEach (function (task) {
        if  ( task.id () === id && ! task.running () ) {
          task.start ()
        }
      })
    },
    stop : function ( id ) {
      console.log ("Stop id : " + id)
      that.state.tasks.forEach (function (task) {
        if  ( task.id () === id &&  task.running () ) {
          task.stop ()
        }
      })
    },

  }

  return this.fns
}
