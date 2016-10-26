angular.module('JackControllerApp', ['ngMaterial'])
    .controller('JackController', ['$http', 
    	function($http) {
            function callGET(name, data) {
                return $http({
                    method: 'GET',
                    url: "http://"+ window.location.hostname + name
                });
            };
            var ctrlMe = this;

            ctrlMe.map = function() {
                callGET("/api/gps").then(function(res){
                    window.lat = res.data.lat;
                    window.lng = res.data.lng;
                });
            };
            ctrlMe.send = function() {
                var https = require('https');
                var data = JSON.stringify({
                 api_key: '6cdcc83f',
                 api_secret: '541cd43f233e8ca4',
                 to: '841234555864',
                 from: '841234555864',
                 text: 'SOS, Phát hiện tình huống nguy hiểm, vui lòng xem tại https://www.google.com/maps/place/'+window.lat+'N'+window.lng+'E'
                });

                var options = {
                 host: 'rest.nexmo.com',
                 path: '/sms/json',
                 port: 443,
                 method: 'POST',
                 headers: {
                   'Content-Type': 'application/json',
                   'Content-Length': Buffer.byteLength(data)
                 }
                };

                var req = https.request(options);

                req.write(data);
                req.end();

                var responseData = '';
                req.on('response', function(res){
                 res.on('data', function(chunk){
                   responseData += chunk;
                 });

                 res.on('end', function(){
                   console.log(JSON.parse(responseData));
                 });
                });
            };
            ctrlMe.map();
        }
    ]);