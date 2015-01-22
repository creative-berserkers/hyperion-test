var hyperion = require('cb-hyperion').Server

var port = process.env.PORT || 8080;
var server = new hyperion(port,'/public/')
var allBroadcast = server.registerBroadcast('all')

var object = {
    value : 12,
    text : 'test'
}


server.registerNewConnection(function(ws){
    allBroadcast.addTarget(ws)
    console.log('new connection registered');
})


server.registerMethod('do', function(ws, msg){
    var counter = 0;
    setInterval(function() {
        object.value = counter + 2
        object.text = String(counter + 4)

        counter++
    }, 10000);
    
    console.log('do called')
})

server.registerObject('myObject',object)