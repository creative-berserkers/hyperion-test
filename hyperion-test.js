var hyperion = require('cb-hyperion').Server

var port = process.env.PORT || 8080;
var server = new hyperion(port,'/public/')
var playerId = 0
var tmp = 0
var board = {
    players : [],
    text : 'test',
    join : function(ws, name){
        var found = false
        board.players.forEach(function(el){
            if(el.id === ws.data.id){
                el.name = name
                found = true
            }
        })
        if(!found){ 
            board.players.push({
                name : name,
                id : ws.data.id
            })
        }
        board.text = 'id: ' + String(tmp++)
        return 'sucessfully joined'
    }
}

server.registerNewConnection(function(ws){
    ws.data = {
        id : playerId++
    }
    console.log('new connection registered');
})

server.registerObject('board',board)

var clients = {}
server.registerObjectGenerator('player',function(ws){
    if(!clients[ws]){
        clients[ws] =  {
            position: {
                x : 10,
                y : 13
            },
            move : function(ws,dir){
                console.log('moving '+dir)
                return dir
            }
        }
    }
    
    return clients[ws]
})