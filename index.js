var WebServer = require("./web/server.js");
var serialjs=require('serialport-js');
var longtitude = "";
var latitude = "";
var url = "";
var msg = "";
var express = require('express');
var app = express();
var rpio = require('rpio');
var keyboard = "";
var alertCount = 0;
var alertLimit = 40;
rpio.init({mapping: 'gpio'});

rpio.open(4, rpio.INPUT, rpio.PULL_DOWN);

function pollcb(pin)
{
        var state = rpio.read(pin) ? 'high' : 'low';
        alertCount++;
		if(alertCount > alertLimit){
			console.log("Object is moving!!!");
			alertCount = 0;
		}
};

rpio.poll(4, pollcb);



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
};

function gotData(data){
	var array = data.split(",");
	switch (array[0]) {
		case "$GPGLL":
			latitude = (array[1] !== "" && array[3] !== "")? array[1]: latitude;
			longtitude = (array[3] !== "" && array[1] !== "")? array[3] : longtitude;
	}
};   


serialjs.open(
    '/dev/ttyACM0',
    start2,
    '\n'
);

function start2(port){
    port.on(
        'data',
        gotData2
    );
};

function gotData2(data){
	keyboard += data[0];
	console.log(data);
};  


function sendVNSMS(content, number){
	var https = require('http');
		var data = JSON.stringify({
		 to: [number],
		 content: content,
		 sms_type: 4,
		 dlr: 0
		});
   		var auth = "Basic " + new Buffer("_ukSiHakGmLDEYOeQ4uiInIV0Z2de4iD" + ":x").toString("base64");

		var options = {
		 host: 'api.speedsms.vn',
		 path: '/index.php/sms/send',
		 method: 'POST',
		 headers: {
		   'Content-Type': 'application/json; charset=utf-8',
		   'Content-Length': Buffer.byteLength(data),
		   'Authorization' : auth

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

app.get('/api/sms', function (req, res) {
       var https = require('https');
		var data = JSON.stringify({
		 api_key: '81c52516',
		 api_secret: '1d168d66fe00d0ca',
		 to: '84905334613',
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
app.get('/api/sms2', function (req, res) {
       sendVNSMS('Thiet bi dang dich chuyen, vi tri hien tai https://www.google.com/maps/place/'+latitude+'N'+longtitude+'E', "01234555864");
});

 /* serves all the static files */
 app.get(/^(.+)$/, function(req, res){ 
     res.sendfile( __dirname +"/web/"+ req.params[0]); 
 });


var server = app.listen(80, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
});

WebServer.initWebServer();

