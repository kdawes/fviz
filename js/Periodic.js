var Periodic = function( opts ) {
    console.log("Periodic : " + JSON.stringify(opts));
    var args = (opts != null) ? _.cloneDeep(opts) : {};

    var state =  {
       id : null,
       interval : args.interval || 500, 
       cb : args.cb || function() {},
       count : args.count || 0,
       execCount : 0,
    };
    
    function init( args ) {
        console.log("INIT - Periodic : " + JSON.stringify(opts));
        //if there is an existing id / interval, stop it.
        if ( state.id ) {
            console.log("init : stopping previous invocation");
            fns.stop();
        } else {
            state = _.cloneDeep(args);
            state.execCount = 0;
            state.id = null;
        }
    };

    var fns = {
        init : init,
        stop : function() {
            console.log("Clear " + state.id )
            if ( state.id ) {
                clearInterval(state.id);
                state.id = null;
            }
        },
        start : function() {
            console.log("start " + state.id + " execCOUNT " + state.execCount + " args.count " + args.count);
            if ( state.cb ) {
                state.id = setInterval(function() {
                    //user specifies a count - drop out if we hit it
                    if ( args.count > 0 && state.execCount >= args.count ) {
                        console.log("STOPPING - count reached");
                        fns.stop();
                        return;
                    }

                    console.log("interval " + ++state.execCount);
                    state.cb(null, state);
                }, state.interval);
            }
        },
        running: function() {
            return state.id != null;
        },
        id: function() {
            return state.id;
        }
    };

    // ---- //
    if ( opts ) {
        init(opts);
    } 

    return fns;
};

exports = module.exports = Periodic;