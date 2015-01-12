var hyperion = require('cb-hyperion').Server

var port = process.env.PORT || 8080;
var server = new hyperion(port,'/public/')
var allBroadcast = server.registerBroadcast('all')

var object = []
Object.observe(object, function(changes) {
    allBroadcast.send(changes)
})

server.registerNewConnection(function(ws){
    allBroadcast.addTarget(ws)
    console.log('new connection registered');
})


server.registerMethod('do', function(ws, msg){
    var counter = 0;
    setInterval(function() {
        object.prop1 = counter + 2
        object.prop2 = String(counter + 4)

        counter++
    }, 10000);
    
    console.log('do called')
})