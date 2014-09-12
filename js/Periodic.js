var Periodic = function( opts ) {
    var state = {
       id : null,
       interval : opts.interval || 500, 
       cb : opts.cb || function() {},
       count : 0
    };
    
    function init( opts ) {
        console.log("INIT - Periodic");
    };

    var fns = {
        stop : function() {
            console.log("clear " + state.id )
            if ( state.id ) {
                clearInterval(state.id);
            }
        },
        start : function() {
            console.log("start" + state.id);
            if ( state.cb ) {
                state.id = setInterval(function() {
                    console.log("interval " + ++state.count);
                    state.cb(null, state);
                });
            }
        }
    };

    // ---- //
    init(opts);

    return fns;
};