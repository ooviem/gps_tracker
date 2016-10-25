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

                    var lat = res.data.lat.replace('.','');
                    var lng = res.data.lng.replace('.','');
                    lat = res.data.lat.splice( 2, 0, ".");
                    lng = res.data.lng.splice( 3, 0, ".");

                    window.lat = lat;
                    window.lng = lng;
                });
            };
            ctrlMe.map();
        }
    ]);