
function onOpen() {
    client.getObject('myObject').then(function(object){
        console.log('received:'+object)
    })
}

var client = Nautilus.createClient({
    host : 'wss://hyperion-test-odrinwhite1.c9.io',
    onopen : onOpen
})





