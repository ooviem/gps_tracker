var WebServer = require("./web/server.js");
var serialjs=require('serialport-js');
var longtitude = "";
var latitude = "";
var url = "";
var msg = "";
var express = require('express');
var app = express();

serialjs.open(
    '/dev/ttyUSB0',
    start,
    '\n'
);

function start(port){
    port.on(
        'data',
        gotData
    );
}

function gotData(data){
	var array = data.split(",");
	switch (array[0]) {
		case "$GPGLL":
			longtitude = (array[1] !== "" && array[3] !== "")? array[1]+ "N": longtitude;
			latitude = (array[3] !== "" && array[1] !== "")? array[3]+"E" : latitude;
	}
	url = "https://www.google.com/maps/place/"+ longtitude + latitude;
}   

var mainFunction = function(){
}

app.get('/gps', function (req, res) {
    res.end({
    	"gps": longtitude+latitude;
    });
})

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})
mainFunction();
WebServer.initWebServer();
