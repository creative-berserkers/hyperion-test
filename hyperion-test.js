var hyperion = require('cb-hyperion').Server

var port = process.env.PORT || 8080;
var server = new hyperion(port,'/public/')
var playerId = 0
var tmp = 0


function findPlayer(players, id){
    var player = null
    players.forEach(function(el){
        if(el.id === id && el.connected){
            player = el
        }
    })
    return player
}

var board = {
    data :{
        counter : 15,
        currentIll : '',
        sickId : 0,
        players : []
    },
    text : 'test',
    join : function(ws, name){
        var found = false
        board.data.players.forEach(function(el){
            if(el.id === ws.data.id && el.connected){
                el.name = name
                found = true
            }
        })
        if(!found){ 
            board.data.players.push({
                x : Math.floor((Math.random() * 800) - 400),
                y : Math.floor((Math.random() * 800) - 400),
                score : 0,
                name : name,
                id : ws.data.id,
                connected : true
            })
        }
        board.text = 'id: ' + String(tmp++)
        return 'sucessfully joined'
    },
    move : function(ws,x,y){
        var player = findPlayer(board.data.players,ws.data.id)
        if(player !== null){
            var dx = x - player.x
            var dy = y - player.y
            
            var length = Math.sqrt(dx*dx + dy*dy)
            
            var ndx = dx / length
            var ndy = dy / length
            
            player.x = player.x +(ndx*100)
            player.y = player.y +(ndy*100)
        }
    }
}

setInterval(function(){
    board.data.counter--
    if(board.data.counter === 0){
        board.data.counter = 15
        if(board.data.players.length > 0){
            while(true){
                var num = Math.floor((Math.random() * board.data.players.length))
                if(board.data.players[num].connected){
                    board.data.currentIll = board.data.players[num].name
                    board.data.sickId = board.data.players[num].id
                    break
                }
            }
        }
    }
},1000)

server.registerNewConnection(function(ws){
    ws.data = {
        id : playerId++
    }
    console.log('new connection registered');
})

server.registerOnDisconnect(function(ws){
    board.data.players.forEach(function(el){
        if(el.id === ws.data.id){
            el.connected = false
        }
    })
    console.log('connection unregistered');
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