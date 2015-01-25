var hyperion = require('cb-hyperion').Server

var port = process.env.PORT || 8080;
var server = new hyperion(port,'/public/')

var board = {
    players : ['player1', 'player2'],
    text : 'test',
    doSth : function(ws){
        board.position.x = board.position.x++
        board.text = 'hello world'
        console.log('do called')
        return board.text
    }
}

server.registerNewConnection(function(ws){
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
            move : function(dir){
                console.log('moving '+dir)
                return dir
            }
        }
    }
    
    return clients[ws]
})