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
var isMoving = false;
var useThiefTracking = true;
rpio.init({mapping: 'gpio'});

rpio.open(4, rpio.INPUT, rpio.PULL_DOWN);

function pollcb(pin)
{
	if(useThiefTracking) {
		var state = rpio.read(pin) ? 'high' : 'low';
		alertCount++;
		if(alertCount > alertLimit){
			console.log("Object is moving!!!");
			alertCount = 0;
			isMoving = true;
			sendVNSMS('Thiet bi dang dich chuyen, vi tri hien tai https://www.google.com/maps/place/'+latitude+'N'+longtitude+'E', "01234555864");
		}
	}
};

var looping = setInterval(loop, 300000);

function loop() {
	if(isMoving && useThiefTracking) {
		sendVNSMS('Thiet bi dang dich chuyen, vi tri hien tai https://www.google.com/maps/place/'+latitude+'N'+longtitude+'E', "01234555864");
	}
}

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

serialjs.open(
    '/dev/ttyACM1',
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
	if(data != '') {
		keyboard += data.trim().charAt(0);
		console.log(keyboard);
	}
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
};

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
    sendVNSMS('SOS, Nguoi than cua ban hien gap nguy hiem, xin xem tai https://www.google.com/maps/place/'+latitude+'N'+longtitude+'E', "01234555864");
    res.json({
    	"OK":"OK"
    });
});
app.get('/api/sms2', function (req, res) {
       sendVNSMS('Thiet bi dang dich chuyen, vi tri hien tai https://www.google.com/maps/place/'+latitude+'N'+longtitude+'E', "01234555864");
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
});

WebServer.initWebServer();

