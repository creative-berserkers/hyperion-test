var phonecatApp = angular.module('gameApp', []);



phonecatApp.controller('GameController', function ($scope) {
    
    function onMessage(apply){
        console.log('onMessage')
        $scope.$apply(function () {
            apply()
            console.log('scope applied')
        })
    }
    
    function onOpen() {
        console.log('onOpen')
        client.getObject('board').then(function(board){
            
            console.log('received board')
            $scope.board = board
            /*object.doSth().then(function(result){
                console.log(result)
            })*/
            /*Object.observe(deep(object), function(changes){
                console.log(changes)
            })*/
            
            client.getObject('player').then(function(player){
                player.move('up').then(function(result){
                    console.log('result '+result)
                })
            })
        })
    }

    var client = Nautilus.createClient({
        host : 'wss://hyperion-test-odrinwhite1.c9.io',
        onopen : onOpen,
        onmessage : onMessage
    })
    
    $scope.board = {
        players : ['local']
    }
    $scope.playername = getCookie('playername')
    $scope.joinGame = function(playername){
        createCookie('playername',playername,10)
    }
    
    
});