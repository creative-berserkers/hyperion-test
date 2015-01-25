var Nautilus = Nautilus || {}

Nautilus.createClient = function(conf) {
    var socket = conf.socket || new WebSocket(conf.host)
    var responsePromises = []
    var responseObject = null
    var objects = []
    var id = 0

    function createProxyMethod(object, objectName, method) {
        var curr = object
        method.forEach(function(node) {
            if (curr[node] === undefined) {
                curr[node] = function() {
                    var currId = id++

                    var promise = new Promise(function(resolve, reject) {
                        responsePromises[currId] = {
                            resolve: resolve,
                            reject: reject
                        }
                    });
                    var object = {
                        type : 'object-call',    
                        path : method,
                        name : objectName,
                        id : currId,
                        args : Array.prototype.slice.call(arguments, 0)
                    }
                    console.log('=>')
                    console.log(object)
                    socket.send(JSON.stringify(object))
                    return promise
                }
            }
            else {
                curr = curr[node]
            }
        })

    }
    
    function applyChange(object, change){
        if(change.type === 'update'){
            var curr = object
            change.path.forEach(function(node){
                if(change.path[change.path.length-1] === node){
                    curr[node] = change.value
                }
                curr = curr[node]
            })
        } else if(change.type === 'splice'){
            var curr = object
            change.path.forEach(function(node){
                if(change.path[change.path.length-1] === node){
                    curr[node].splice.apply(curr[node],[change.index,change.removedCount].concat(change.added))
                }
                curr = curr[node]
            })
        }
    }
    
    function applyChanges(object, changes){
        changes.forEach(function(change){
            applyChange(object, change)
        })
    }

    var client = {
        getObject: function(name) {
            var promise = new Promise(function(resolve, reject) {
                reponseObject = {
                    resolve: resolve,
                    reject: reject
                }
            });

            socket.send(JSON.stringify({
                type: 'get-object',
                name: name
            }))
            return promise
        }
    }

    socket.onopen = function(event) {
        if (conf.onopen) conf.onopen(client);
    }

    socket.onmessage = function(event) {
        function apply() {
            var msg = JSON.parse(event.data)
            console.log('<=')
            console.log(msg)
            if (msg.type === 'call-response') {
                responsePromises[msg.id].resolve(msg.result)
                delete responsePromises[msg.id]
            }
            if (msg.type === 'object-response') {
                objects[msg.name] = msg.object
                msg.methods.forEach(function(method) {
                    createProxyMethod(msg.object, msg.name, method)
                })
                reponseObject.resolve(msg.object)
            }
            if (msg.type === 'object-broadcast') {
                console.log('applying changes')
                var object = objects[msg.name]
                if(object){
                    applyChanges(object, msg.changes)
                } else {
                    console.log('object not found '+msg.name)
                }
            }
        }
        if (conf.onmessage) {
            conf.onmessage(apply)
        } else {
            apply()
        }
        
    }
    return client
}