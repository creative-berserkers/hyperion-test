var Nautilus = Nautilus || {}

Nautilus.createClient = function(conf) {
    var socket = conf.socket || new WebSocket(conf.host)
    var responsePromises = []
    var broadcasts = []
    var id=0;

    var client = {
        call: function(name) {
            var currId = id++
            
            var promise = new Promise(function(resolve, reject){
                responsePromises[currId] = {
                    resolve : resolve,
                    reject : reject
                }
            });
            
            socket.send(JSON.stringify({
                type: 'call',
                name: name,
                id: currId,
                args: Array.prototype.slice.call(arguments, 1)
            }))
            return promise
        },
        registerBroadcastHandler : function(name, callback, ctx){
            broadcasts[name] = {
                callback: callback,
                ctx : ctx
            }
        }
    }
    
    socket.onopen = function(event) {
        if(conf.onopen) conf.onopen(client);
    }

    socket.onmessage = function(event) {
        var msg = JSON.parse(event.data)
        if (msg.type === 'response') {
            responsePromises[msg.id].resolve(msg.result)
            delete responsePromises[msg.id]
        } if(msg.type === 'broadcast') {
            var bc = broadcasts[msg.name]
            if(bc) bc.callback.apply(bc.ctx, msg.args)
        }
    }
    return client
}