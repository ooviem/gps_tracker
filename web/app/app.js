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
                callGET("/api/sms").then(function(res){
                    if(res.data === "OK"){
                        alert("Gởi thành công");
                    }
                });
            };
            ctrlMe.send2 = function() {
                callGET("/api/sms2").then(function(res){
                    if(res.data === "OK"){
                        alert("Gởi thành công");
                    }
                });
            };
            ctrlMe.maps = function() {
                window.location.href = 'https://www.google.com/maps/place/'+window.lat+'N'+window.lng+'E';

            };
            ctrlMe.camera = function() {
               window.location.href = "http://"+window.location.hostname + ":5000";
            };
            ctrlMe.map();
        }
    ]);