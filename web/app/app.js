angular.module('JackControllerApp', ['ngMaterial'])
    .controller('JackController', ['$http', 
    	function($http) {

            function callGET(name, data) {
                return $http({
                    method: 'GET',
                    url: "http://"+ window.location.hostname + name,
                    data: {
                        key: data
                    }
                });
            };
            var ctrlMe = this;

            ctrlMe.listFiles = "";
            ctrlMe.listImage = [];
            ctrlMe.key = "";
            callGET("/api/images").then(function(res){
                ctrlMe.listFiles = res.data.data.reverse();
                res.data.data.forEach(function(file) {
                    if(file.endsWith(".jpg")){
                         ctrlMe.listImage.push(file);
                    }
                });
                console.log(ctrlMe.listFiles);
            });

            ctrlMe.keyboard = function() {
                callGET("/api/keyboard", ctrlMe.key).then(function(res){
                    if(res.data === "OK"){
                        alert("Gởi thành công");
                        ctrlMe.key = "";
                    }
                });
            };

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
            ctrlMe.delete = function() {
                callGET("/api/delete").then(function(res){
                    if(res.data === "OK"){
                        alert("Xóa thành công");
                    }
                });
            };
            ctrlMe.capture = function() {
                callGET("/api/capture").then(function(res){
                    if(res.data === "OK"){
                    }
                });
            };
            ctrlMe.record = function() {
                callGET("/api/record").then(function(res){
                    if(res.data === "OK"){
                    }
                });
            };
            ctrlMe.reset = function() {
                callGET("/api/reset").then(function(res){
                    if(res.data === "OK"){
                    }
                });
            };
            ctrlMe.reboot = function() {
                callGET("/api/reboot").then(function(res){
                    if(res.data === "OK"){
                    }
                });
            };
            ctrlMe.maps = function() {
                window.location.href = 'https://www.google.com/maps/place/'+window.lat+','+window.lng;

            };
            ctrlMe.camera = function() {
               window.location.href = "http://"+window.location.hostname + ":5000";
            };
            ctrlMe.map();
        }
    ]);