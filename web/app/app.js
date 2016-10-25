angular.module('JackControllerApp', ['ngMaterial'])
    .controller('JackController', ['$http', 
    	function($http) {
            function callGET(name, data) {
                return $http({
                    method: 'GET',
                    url: window.location.hostname + ":8081" + name
                });
            };
            var ctrlMe = this;

            ctrlMe.map = function() {
                callGET("/gps").then(function(data){
                    var uluru = {lat: data.lat, lng: data.lng};
                    var map = new google.maps.Map(document.getElementById('map'), {
                      zoom: 8,
                      center: uluru
                    });
                    var marker = new google.maps.Marker({
                      position: uluru,
                      map: map
                    });
                });
            };
            ctrlMe.map();
        }
    ]);