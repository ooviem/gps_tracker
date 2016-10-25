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
                    ctrlMe.lat = res.data.lat;
                    ctrlMe.lng = res.data.lng;
                });
            };
            ctrlMe.map();
        }
    ]);