var client = Nautilus.createClient({
    host : 'wss://hyperion-test-odrinwhite1.c9.io'
});

client.registerBroadcastHandler('all', function(msg){
    console.log(msg)
})



