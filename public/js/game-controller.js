var phonecatApp = angular.module('gameApp', []);



phonecatApp.controller('GameController', function($scope) {

    function noCall() {
        console.warn('call not reached')
    }

    function onMessage(apply) {
        console.log('onMessage')
        $scope.$apply(function() {
            apply()
            console.log('scope applied')
        })
    }

    function onOpen() {
        console.log('onOpen')
        client.getObject('board').then(function(board) {

            console.log('received board')
            $scope.board = board
                /*object.doSth().then(function(result){
                    console.log(result)
                })*/
                /*Object.observe(deep(object), function(changes){
                    console.log(changes)
                })*/

            client.getObject('player').then(function(player) {
                player.move('up').then(function(result) {
                    console.log('result ' + result)
                })
            })
        })
    }

    var client = Nautilus.createClient({
        host: 'wss://hyperion-test-odrinwhite1.c9.io',
        onopen: onOpen,
        onmessage: onMessage
    })

    $scope.board = {
        data: {
            players: []
        },
        join: noCall
    }
    $scope.joined = false
    $scope.playername = getCookie('playername')
    $scope.joinGame = function(playername) {
        if (getCookie('playername') !== '') {
            eraseCookie('playername')
        }
        createCookie('playername', playername, 10)
        $scope.playername = playername
        $scope.board.join(playername).then(function() {
            $scope.joined = true
            initGame()
        })
    }

    function initGame() {
        var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game-canvas', {
            preload: preload,
            create: create,
            update: update,
            render: render
        });
        
        var sprite

        function preload() {

            game.stage.backgroundColor = '#007236';

            //game.load.image('ball', 'assets/sprites/shinyball.png');
            game.load.spritesheet('mushroom', 'assets/grzybsheet.png',64,64);
            //game.load.image('phaser', 'assets/sprites/sonic_havok_sanity.png');

        }

        var cursors;
    
        var sprite = null
        
        var mouseDown = false
        
        var timer = null
        
        var players = []
        
        var style = { font: "24px Arial", fill: "#00ff00", align: "center" };

        function create() {

            //  Modify the world and camera bounds
            game.world.setBounds(-1000, -1000, 2000, 2000);

            

            //  This will create a new object called "cursors", inside it will contain 4 objects: up, down, left and right.
            //  These are all Phaser.Key objects, so anything you can do with a Key object you can do with these.
            cursors = game.input.keyboard.createCursorKeys();
            game.input.onDown.add(function(){
                mouseDown = true
            })
            
            game.input.onUp.add(function(){
                mouseDown = false
            })
            
            //  Create our Timer
            timer = game.time.create(false);
            timer.loop(300, updateCounter, this);
            timer.start();
        }
        
        function updateCounter(){
            if(mouseDown){
                $scope.board.move(game.input.x, game.input.y)
            }
            var playerId = findPlayer($scope.board.data.players, $scope.board.data.sickId)
            
            if(playerId !== -1){
                players.forEach(function(p){
                    p.mySprite.frame = 0
                })
                players[playerId].mySprite.frame = 1
            }
        }
        
        function createPlayerSprite(player){
            console.log('sprite created')
            var playerGroup = game.add.group();
            playerGroup.x  = player.x
            playerGroup.y = player.y
            playerGroup.pivot.x = 0.5
            playerGroup.pivot.y = 0.5
            var sprite = game.add.image(-32, -32, 'mushroom');
            playerGroup.add(sprite)
            sprite.frame = 0
            var t = game.add.text(-32, -64, player.name, style)
            playerGroup.add(t)
            playerGroup.mySprite = sprite
            return playerGroup
        }
        
        function findPlayer(players, id){
            var result = -1;
            players.forEach(function(el){
                if(el.id === id && el.connected){
                    result = el.id
                }
            })
            return result
        }

        function update() {
            
            if(players.length != $scope.board.data.players.length){
                
                for(var i = players.length ; i < $scope.board.data.players.length; ++i){
                    players[i] = createPlayerSprite($scope.board.data.players[i])
                }
            }
            
            for(var i = 0; i < $scope.board.data.players.length; ++i){
                if(players[i].x !== $scope.board.data.players[i].x || players[i].y !== $scope.board.data.players[i].y){
                    var tween = game.add.tween(players[i]);
                    tween.to({ 
                        x: $scope.board.data.players[i].x + 32,
                        y: $scope.board.data.players[i].y}, 290);
                    tween.start();
                }
            }
            
            for(var i = 0; i < $scope.board.data.players.length; ++i){
                if($scope.board.data.players[i].infected || $scope.board.data.players[i].id === $scope.board.data.sickId){
                    if($scope.board.data.players[i].id === $scope.board.data.sickId){
                        players[i].mySprite.scale.set(1.2,1.2)
                    } else {
                        players[i].mySprite.scale.set(0.5,0.5)
                    }
                    players[i].mySprite.frame = 1
                } else {
                    players[i].mySprite.scale.set(1,1)
                    players[i].mySprite.frame = 0
                }
            }
            
            
        }

        function render() {

            //game.debug.cameraInfo(game.camera, 32, 500);

        }
    }




});