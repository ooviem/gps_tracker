var WebServer = require("./web/server.js");
var serialjs=require('serialport-js');
var longtitude = "";
var latitude = "";
var url = "";
var msg = "";
var express = require('express');
var app = express();
var rpio = require('rpio');

// rpio.init({mapping: 'gpio'});

// rpio.open(4, rpio.INPUT, rpio.PULL_DOWN);

// function pollcb(pin)
// {
//         /*
//          * Interrupts aren't supported by the underlying hardware, so events
//          * may be missed during the 1ms poll window.  The best we can do is to
//          * print the current state after a event is detected.
//          */
//         var state = rpio.read(pin) ? 'high' : 'low';
//         console.log(pin+ " " + state);
// }

// rpio.poll(4, pollcb);



// serialjs.open(
//     '/dev/ttyUSB0',
//     start,
//     '\n'
// );

// function start(port){
//     port.on(
//         'data',
//         gotData
//     );
// }

// function gotData(data){
// 	var array = data.split(",");
// 	switch (array[0]) {
// 		case "$GPGLL":
// 			latitude = (array[1] !== "" && array[3] !== "")? array[1]: latitude;
// 			longtitude = (array[3] !== "" && array[1] !== "")? array[3] : longtitude;
// 	}
// }   


serialjs.open(
    '/dev/ttyUSB2',
    start2,
    '\n'
);

function start2(port){
    port.on(
        'data',
        gotData2
    );
}

function gotData2(data){
    console.log(data);
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
       var https = require('https');
		var data = JSON.stringify({
		 api_key: '960d4cc1',
		 api_secret: '63d52d8d586fa8e2',
		 to: '84906625050',
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

