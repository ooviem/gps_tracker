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
var alertFlameCount = 0;
var alertFlameLimit = 1;
var isBurning = false;
var isMoving = false;
var useThiefTracking = false;
var useFlameDetector = false;
var arduino1;
var arduino2;
var phoneNumber = "01234555864";
var command = require("./command.js");
var isTakingPhoto = false;
var isRecording = false;
var isSOS = false;
var fs = require('fs');

rpio.init({mapping: 'gpio'});

rpio.open(4, rpio.INPUT, rpio.PULL_DOWN);
rpio.open(17, rpio.INPUT, rpio.PULL_DOWN);
rpio.open(18, rpio.INPUT, rpio.PULL_DOWN);

function sendFireAlert(){
	sendVNSMS('Phat hien chay, vi tri hien tai https://www.google.com/maps/place/'+latitude+'N'+longtitude+'E', phoneNumber);
	takePhoto();
	alertBuzzer("S");
};

function sendSOS(){
 	sendVNSMS('SOS, Nguoi than cua ban hien gap nguy hiem, xin xem tai https://www.google.com/maps/place/'+latitude+'N'+longtitude+'E', "01234555864");
 	takePhoto();
	alertBuzzer("S");
};

function sendThiefAlert(){
	sendVNSMS('Thiet bi dang dich chuyen, vi tri hien tai https://www.google.com/maps/place/'+latitude+'N'+longtitude+'E', phoneNumber);
	takePhoto();
	alertBuzzer("S");
};

function pollVib(pin)
{
	if(useThiefTracking) {
		var state = rpio.read(pin) ? 'high' : 'low';
		alertCount++;
		if(alertCount > alertLimit){
			console.log("Object is moving!!!");
			alertCount = 0;
			if(!isMoving){
				isMoving = true;
				sendThiefAlert();
			}
		}
	}
};


function pollFlame(pin)
{
	if(useFlameDetector) {
		var state = rpio.read(pin) ? 'high' : 'low';
		alertFlameCount++;
		console.log(state);
		if(alertFlameCount > alertLimit){
			console.log("Flame dectected!!!");
			alertFlameCount = 0;
			if(!isBurning){
				sendFireAlert();
			}
		}
	}
};

function takePhoto(){
	isTakingPhoto = true;
	command.exe("sudo ./camera.sh").then(function(){
		isTakingPhoto = false;
		console.log("photo taken!!!");
	});
};
function recordVideo(){
	console.log("start recording");
	command.exe("sudo ./video.sh").then(function(){
		isRecording = false;
		console.log("end recording");
	});
};

function pollTouch(pin)
{
	var state = rpio.read(pin) ? 'high' : 'low';
	alertBuzzer("S");

	if(state == 'high'){
		if(!isRecording){
			takePhoto();
		}
	} else {
		setTimeout(function(){
			if(!rpio.read(pin) && !isRecording){
				isRecording = true;
				alertBuzzer("P");
				recordVideo();
			}
		}, 1500);
	}
};
rpio.poll(4, pollVib);
rpio.poll(17, pollFlame);
rpio.poll(18, pollTouch);


var looping = setInterval(loop, 60000);

function loop() {
	if(isMoving && useThiefTracking) {
		sendThiefAlert();
	} else {
		isMoving = false;
	}
	if(isSOS){
		sendSOS();
	}
	if(isBurning && useFlameDetector && rpio.read(17)) {
		sendFireAlert();
	} else {
		isBurning = false;
	}
}

function commandTracking(){
	if(keyboard === "A#"){
		keyboard = "";
		setTimeout(function() {
			useThiefTracking = useThiefTracking? false : true;
			if(!useThiefTracking){
				alertBuzzer("P");
			}
			console.log("Thief dectector: "+ useThiefTracking);
		}, 2000);
	} else if(keyboard === "B#") {
		keyboard = "";
		useFlameDetector = useFlameDetector? false : true;
		if(!useFlameDetector){
			alertBuzzer("P");
		}
		console.log("Flame dectector: "+ useFlameDetector);
	} else if(keyboard.indexOf("C#") > -1 && keyboard.charAt(keyboard.length -1 ) == "*") {
		phoneNumber = keyboard.replace("C#", '');
		phoneNumber = phoneNumber.replace("*", '');
		keyboard = "";
	} else if(keyboard.indexOf("D") > -1 && keyboard != "") {
		keyboard = keyboard.substring(0, keyboard.length - 2);
	} else if(keyboard.indexOf("**") > -1) {
		keyboard = "";
	} else if(keyboard.indexOf("911#") > -1) {
		isSOS = isSOS? false : true;
		if(isSOS){
			sendSOS();
		} else {
		    alertBuzzer("P");
		}
		keyboard = "";
	} else if(keyboard.indexOf("123#") > -1) {
		keyboard = "";
		isMoving = false;
		isBurning = false;
		isSOS = false;
		useFlameDetector = false;
		useThiefTracking = false;
		alertBuzzer("P");
		console.log("Keyboard cleared!");
		console.log("Flame dectector: "+ useFlameDetector);
		console.log("Thief dectector: "+ useThiefTracking);
	}
};



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
    start1,
    '\n'
);

serialjs.open(
    '/dev/ttyACM1',
    start2,
    '\n'
);
function start1(port){
    port.on(
        'data',
        gotData2
    );
	arduino1 = port;	

};

function start2(port){
    port.on(
        'data',
        gotData3
    );
	arduino2 = port;	
};

function gotData2(data){
	if(data != '') {
		keyboard += data.trim().charAt(0);
		console.log(keyboard);
		commandTracking();
	}
};

function gotData3(data){
	if(data != '') {
		keyboard += data.trim().charAt(0);
		console.log(keyboard);
		commandTracking();
	}
};


function alertBuzzer(key){
	if(arduino1){
		arduino1.send(key);
	}
	if(arduino2){
		arduino2.send(key);
	}
}


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
    res.sendfile('./gps_tracker/web/index.html')
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

app.get('/api/images', function (req, res) {
	var testFolder = './web/camera/';
	var response = [];
	fs.readdir(testFolder, function (err, files) { // '/' denotes the root folder
		response = files;
		res.json({
    		"data": response
   	    });
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

