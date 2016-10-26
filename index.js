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
			latitude = (array[1] !== "" && array[3] !== "")? array[1]: longtitude;
			longtitude = (array[3] !== "" && array[1] !== "")? array[3] : latitude;
	}
}   

var mainFunction = function(){
}
 /* serves main page */
 app.get("/", function(req, res) {
    res.sendfile('./web/index.html')
 });

app.get('/api/gps', function (req, res) {
    res.json({
    	"lat": latitude,
    	"lng": longtitude
    });
});


 /* serves all the static files */
 app.get(/^(.+)$/, function(req, res){ 
     res.sendfile( __dirname +"/web/"+ req.params[0]); 
 });


var server = app.listen(80, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})
mainFunction();
WebServer.initWebServer();
