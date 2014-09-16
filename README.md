fviz - experiments with browser bundling / module options and webworkers

Notes : bower components checked into git, browserify and grunt-cli in the path
**git clone
**npm install

$ browserify -v -r ./js/Periodic:Periodic -r ./js/Runner:Runner -o js/browserifybundle.js --watch &
$ grunt && static