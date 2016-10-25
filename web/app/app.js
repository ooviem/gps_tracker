angular.module('JackControllerApp', ['ngMaterial'])
    .controller('JackController', ['$http', 
    	function($http) {
            function callGET(url, data) {
                return $http({
                    method: 'GET',
                    url: window.location.hostname + url
                });
            };
            var ctrlMe = this;

            ctrlMe.map = function(code) {
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