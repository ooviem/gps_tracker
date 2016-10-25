angular.module('JackControllerApp', ['ngMaterial'])
    .controller('JackController', ['$http', 
    	function($http) {
            function callGET(url, data) {
                return $http({
                    method: 'GET',
                    url: 'http://192.168.43.9:3000/api/robots/Jack/commands/' + url
                });
            };
            function callPOST(url, data) {
                return $http({
                    method: 'POST',
                    data: data,
                    url: 'http://192.168.43.9:3000/api/robots/Jack/commands/' + url
                });
            };
            var ctrlMe = this;
            ctrlMe.keyUp = function(code) {
                callGET("stop");
            };
            ctrlMe.gift = function(code) {
                callGET("gift");
            };
            ctrlMe.keyDown = function(code) {
                if(code === 37) {
                    callGET("turnLeft");
                } else if(code === 38) {
                    callGET("runForward");
                } else if(code === 39) {
                   callGET("turnRight");
                } else if(code === 40) {
                   callGET("runBackward");
                }
            
            };
            ctrlMe.runForward = function() {
                callGET("runForward");
            };
            ctrlMe.runBackward = function() {
                callGET("runBackward");
            };
            ctrlMe.turnLeft = function() {
                callGET("turnLeft");
            };
            ctrlMe.turnRight = function() {
                callGET("turnRight");
            };
            ctrlMe.stop = function() {
                callGET("stop");
            };
            ctrlMe.speak = function(words) {
                callPOST("speak", { text: words});
            };

            ctrlMe.headLeft = function() {
                callGET("headLeft");
            };
            ctrlMe.headRight = function() {
                callGET("headRight");
            };
            ctrlMe.headUp = function() {
                callGET("headUp");
            };
            ctrlMe.headDown = function() {
                callGET("headDown");
            };

            ctrlMe.headMove = function(position) {
                callPOST("headMove", { position: position});
            };
            ctrlMe.headTurn = function(position) {
                callPOST("headTurn", { position: position});
            };

            ctrlMe.test = function() {
                callGET("test");
            };

            ctrlMe.test2 = function() {
                callGET("test2");
                
            };

            ctrlMe.speak = function() {
                callGET("hello");
                
            };
            ctrlMe.photo = function() {
                callGET("photo");
                
            };
            ctrlMe.record = function() {
                callGET("record");
                
            };
            ctrlMe.distance = function() {
                callGET("distance");
                
            };
            ctrlMe.detectObject = function() {
                callGET("detectObject");
                
            };
        }
    ]);