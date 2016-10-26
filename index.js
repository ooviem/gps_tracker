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
			latitude = (array[1] !== "" && array[3] !== "")? array[1]: latitude;
			longtitude = (array[3] !== "" && array[1] !== "")? array[3] : longtitude;
	}
}   

var mainFunction = function(){
}
 /* serves main page */
 app.get("/", function(req, res) {
    res.sendfile('./gps_tracker/web/index.html')
 });

app.get('/api/gps', function (req, res) {
    res.json({
    	"lat": latitude,
    	"lng": longtitude
    });
});
app.get('/api/sms', function (req, res) {
       var https = require('https');
		var data = JSON.stringify({
		 api_key: '6cdcc83f',
		 api_secret: '541cd43f233e8ca4',
		 to: '841234555864',
		 from: '841234555864',
		 text: 'SOS, Nguoi than cua ban hien gap nguy hiem, xin xem tai https://www.google.com/maps/place/'+latitude+'N'+longtitude+'E'
		});

		var options = {
		 host: 'rest.nexmo.com',
		 path: '/sms/json',
		 port: 443,
		 method: 'POST',
		 headers: {
		   'Content-Type': 'application/json; charset=utf-8',
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
    res.json({
    	"OK":"OK"
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
