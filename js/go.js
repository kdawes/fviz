      var Proc = require('Proc');
      var engine = new Proc();
      var work = require('webworkify');

      // var opts = { 
      //   "interval":500, 
      //   "count":32, 
      //   "cb" : function(e,r) { 
      //     console.log("cb!" + JSON.stringify(r)); 
      //     $('#messages').html(JSON.stringify(r)); 
      //   },
      // }
      // console.log("periodic");
      // var Periodic = require('Periodic');
      // console.log("Required periodic - instanceOf ? " + (Periodic instanceof Periodic));
      // var p = new Periodic(opts);
      // console.log("new Periodic() instanceof ? "+ ( p instanceof Periodic));
      // var Runner = require('Runner');
      // var r = new Runner();
      // r.add(p);
      // r.startall();

      var routes = {
        '/filter': filter,
        '/shannon': shannon,
        '/raw': raw,
        '/list': list,
        "/":list
      };

      var config = {
        "engine": { 
        }, 
        "width":6, 
        "height":6, 
        "spanw":2048, 
        "spanh":16384, 
        "grid":false
      }; 

      function shannon() {
        console.log("SHannon route");
        var cfg = _.cloneDeep(config);
        cfg.engine.blksz = 20;
        cfg.engine.type = "shannon";
        engine.go(cfg);
      }

      function filter() {
        console.log("Filter route");
        var cfg = _.cloneDeep(config);
        cfg.engine.type = "filter";
        cfg.width=5;
        cfg.height=5;
        cfg.grid = true;
        engine.go(cfg);
      }

      function raw() {
        console.log("raw route");
        var cfg = _.cloneDeep(config);
        cfg.engine.type = "raw";
        cfg.grid = true;
        engine.go(cfg);
      }

      function list() {
        $().ready(function(){
          $("#msgs").empty();
          Object.keys(routes).forEach(function(r) {
            var ctnt = "<a href='/#" + r +"'>"+ r +"</a>";
            console.log("LIST :> " + ctnt);

            $("#msgs").append(ctnt + " </br>");

          });
        });
      }
    
      var router = Router(routes);

      router.init();