var hyperion = require('cb-hyperion').Server

var server = new hyperion(8888)
var allBroadcast = server.registerBroadcast('all')

var object = {}
Object.observe(object, function(changes) {
    changes.forEach(function(change) {
        allBroadcast.send(change)
    })
})

server.registerNewConnection(function(ws){
    allBroadcast.addTarget(ws)
    console.log('new connection registered');
})


server.registerMethod('do', function(ws, msg){
    object.test = msg
    console.log('do called')
})