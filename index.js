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
var phoneNumber = "0905334613";
var command = require("./command.js");
var isTakingPhoto = false;
var isRecording = false;
var isSOS = false;
var fs = require('fs');
var location = {};
var nmea = require('nmea');
var isFixedPosition = false;
var gypoLimit = 20000;
var hasFalling = false;
var useFallDetection = false;
rpio.init({mapping: 'gpio'});
var isBuzzing = false;

function sendSOS(){
 	sendVNSMS('SOS, Nguoi than cua ban hien gap nguy hiem, xin xem tai https://www.google.com/maps/place/'+latitude+','+longtitude, phoneNumber);
 	takePhoto();
	alertBuzzer("S");
};
function sendFallSMS(){
 	sendVNSMS('SOS, Nguoi than cua ban vua gap tai nan, xin xem tai https://www.google.com/maps/place/'+latitude+','+longtitude, phoneNumber);
 	takePhoto();
	alertBuzzer("S");
};


function takePhoto(){
	isTakingPhoto = true;
	command.exe("sudo ./gps_tracker/camera.sh").then(function(){
		isTakingPhoto = false;
		console.log("photo taken!!!");
	});
};
function recordVideo(){
	console.log("start recording");
	command.exe("sudo ./gps_tracker/video.sh").then(function(){
		isRecording = false;
		console.log("end recording");
	});
};

rpio.open(17, rpio.OUTPUT, rpio.HIGH);


var looping = setInterval(loop, 180000);
var buzzerLoop = setInterval(buzzerLooper, 500);

var fixedLoop =  setInterval(fixedLooper, 500);
function fixedLooper() {
	if(isFixedPosition){
		rpio.write(17, rpio.LOW);
		setTimeout(function(){
			rpio.write(17, rpio.HIGH);
		},300);
		clearInterval(fixedLoop);
	} 
}
function buzzerLooper() {
	if(isBuzzing){
		console.log("buzzer");
		rpio.write(17, rpio.LOW);
		setTimeout(function(){
			rpio.write(17, rpio.HIGH);
		},250);
	} else {
		rpio.write(17, rpio.HIGH);
	}
}

function alertBuzzer(key){
	if(key === "P") {
		isBuzzing = false;
	} else {
		console.log(key);
		isBuzzing = true;
	}
};


function loop() {
	if(isSOS){
		sendSOS();
	} else if(hasFalling) {
		sendFallSMS();
	}
}

function commandTracking(){
	if(keyboard.indexOf("**") > -1) {
		keyboard = "";
	} else if(keyboard.indexOf("911#") > -1) {
		isSOS = isSOS? false : true;
		if(isSOS){
			sendSOS();
		} else {
		    alertBuzzer("P");
		}
		keyboard = "";
	} else if(keyboard.indexOf("O") > -1) {
		if(!isTakingPhoto){
			isTakingPhoto = true;
			takePhoto();
		}
		keyboard = "";
	} else if(keyboard.indexOf("111#") > -1) {
		useFallDetection = useFallDetection? false : true;
		console.log('use fall detection');
		rpio.write(17, rpio.LOW);
		setTimeout(function(){
			rpio.write(17, rpio.HIGH);
		},250);
		keyboard = "";
	} else if(keyboard.indexOf("000#") > -1) {
   		command.exe("sudo reboot").then(function(){});
   		rpio.write(17, rpio.LOW);
		setTimeout(function(){
			rpio.write(17, rpio.HIGH);
		},250);
		console.log('reboot');
		keyboard = "";
	} else if(keyboard.indexOf("999#") > -1) {
   		command.exe("sudo shutdown").then(function(){});
   		rpio.write(17, rpio.LOW);
		setTimeout(function(){
			rpio.write(17, rpio.HIGH);
		},250);
		console.log('shutdown');
		keyboard = "";
	} else if(keyboard.indexOf("##") > -1) {
		if(!isRecording){
			isRecording = true;
			recordVideo();
		}
		keyboard = "";

	} else if(keyboard.indexOf("3#") > -1 && keyboard.charAt(keyboard.length -1 ) == "*") {
		phoneNumber = keyboard.replace("3#", '');
		phoneNumber = phoneNumber.replace("*", '');
		keyboard = "";
		console.log('change phoneNumber to '+ phoneNumber);
		rpio.write(17, rpio.LOW);
		setTimeout(function(){
			rpio.write(17, rpio.HIGH);
		},250);

	} else if(keyboard.indexOf("123#") > -1) {
		keyboard = "";
		isSOS = false;
		useFallDetection = false;
		isBuzzing = false;
		hasFalling = false;
		alertBuzzer("P");
		console.log("Reset all!");
	}
};



function convertLat(lat, latPle){
	var dd = lat.substring(0,2);
	var mm = lat.substring(2);
	var mInRad = mm/60 + "";
	return dd+mInRad.substring(1)+latPle;
};
function convertLon(lat, lonPle){
	var ddd = lat.substring(0,3);
	var mm = lat.substring(3);
	var mInRad = mm/60 + "";
	return ddd+mInRad.substring(1)+lonPle;
};

var SerialPort = require('serialport');
 
var port = new SerialPort('/dev/ttyUSB0', {
  parser: SerialPort.parsers.readline('\r\n'),
  baudRate: 4800
});

port.on('data', function (data) {
	try {
		if(data !== '' && data.startsWith("$")){
			var location = nmea.parse(data.trim());
			if(location.status === "valid" || location.fixType === "fix"){
				longtitude = convertLon(location.lon, location.lonPole);
				latitude = convertLat(location.lat, location.latPole);
				isFixedPosition = true;
				console.log(isFixedPosition);
			}

		}
	} catch(e) {
		console.log(e);
	}
});

 
var port2 = new SerialPort('/dev/ttyACM0', {
  parser: SerialPort.parsers.readline('\r\n')
});

port2.on('data', function (data) {
	if(data != '') {
		var firstChar = data.trim().charAt(0);
		if(firstChar !== "$") {
			keyboard += data.trim().charAt(0);
			console.log(keyboard);
			commandTracking();
		} else {
			var array = data.substring(1).trim().split(',');
			gyroMonitor(array);
		}

	}
});

function gyroMonitor(array){
	var Ax, Ay, Az, Gx, Gy, Gz, gGx, gGy, gGz;
	Ax = array[0];
	Ay = array[1];
	Az = array[2];
	Gx = array[3];
	Gy = array[4];
	Gz = array[5];
	gGx = Math.abs(Gx) > gypoLimit ? 1 : 0;
	gGy = Math.abs(Gy) > gypoLimit ? 1 : 0;
	gGz = Math.abs(Gz) > gypoLimit ? 1 : 0;
	if(gGx + gGy+ gGz >= 2) {
		if(!hasFalling && useFallDetection) {
			hasFalling = true;
			sendFallSMS();
		}
		console.log("Fall detected");
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
    sendVNSMS('Vi tri hien tai cua thiet bi https://www.google.com/maps/place/'+latitude+','+longtitude, phoneNumber);
    res.json({
    	"OK":"OK"
    });
});

app.get('/api/reboot', function (req, res) {
    command.exe("sudo reboot").then(function(){
	});
	res.json({
    	"OK":"OK"
    });
});

app.get('/api/capture', function (req, res) {
	takePhoto();
    res.json({
    	"OK":"OK"
    });
});
app.get('/api/record', function (req, res) {
	recordVideo();
    res.json({
    	"OK":"OK"
    });
});
app.get('/api/reset', function (req, res) {
	keyboard = "";
	isSOS = false;
	alertBuzzer("P");
	console.log("Keyboard cleared!");
    res.json({
    	"OK":"OK"
    });
});

app.get('/api/delete', function (req, res) {
    command.exe("sudo rm -r ./gps_tracker/web/camera/*").then(function(){
		console.log("photo deleted!!!");
	});
	res.json({
    	"OK":"OK"
    });
});

app.get('/api/images', function (req, res) {
	var testFolder = './gps_tracker/web/camera/';
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

