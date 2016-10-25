var WebServer = require("./web/server.js");
var serialjs=require('serialport-js');
var longtitude = "";
var latitude = "";
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
			longtitude = (array[0] !== "")? array[1] : longtitude+ "N";
			latitude = (array[0] !== "")? array[3] : latitude+"E";
	}
	console.log(longtitude + " " + latitude);
}   

var mainFunction = function(){
}
mainFunction();
WebServer.initWebServer();
