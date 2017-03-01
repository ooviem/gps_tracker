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
var location = {};
var nmea = require('nmea');
var isFixedPosition = false;
rpio.init({mapping: 'gpio'});
var isBuzzing = false;
// rpio.open(4, rpio.INPUT, rpio.PULL_DOWN);
// rpio.open(17, rpio.INPUT, rpio.PULL_DOWN);
// rpio.open(18, rpio.INPUT, rpio.PULL_DOWN);
rpio.open(12, rpio.OUTPUT);
rpio.write(12, rpio.LOW);
function sendFireAlert(){
	sendVNSMS('Phat hien chay, vi tri hien tai https://www.google.com/maps/place/'+latitude+','+longtitude, phoneNumber);
	takePhoto();
	alertBuzzer("S");
};

function sendSOS(){
 	sendVNSMS('SOS, Nguoi than cua ban hien gap nguy hiem, xin xem tai https://www.google.com/maps/place/'+latitude+','+longtitude, phoneNumber);
 	takePhoto();
	alertBuzzer("S");
};

function sendThiefAlert(){
	sendVNSMS('Thiet bi dang dich chuyen, vi tri hien tai https://www.google.com/maps/place/'+latitude+','+longtitude, phoneNumber);
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

// function pollTouch(pin)
// {
// 	var state = rpio.read(pin) ? 'high' : 'low';
// 	if(state == 'high'){
// 		if(!isRecording){
// 			takePhoto();
// 		}
// 	} else {
// 		setTimeout(function(){
// 			if(!rpio.read(pin) && !isRecording){
// 				isRecording = true;
// 				recordVideo();
// 			}
// 		}, 1500);
// 	}
// };
// rpio.poll(4, pollVib);
// rpio.poll(17, pollFlame);
// rpio.poll(18, pollTouch);


var looping = setInterval(loop, 60000);
var buzzerLoop = setInterval(buzzerLooper, 1000);

function buzzerLooper() {
	if(isBuzzing){
		console.log("buzzer");
		rpio.write(12, rpio.HIGH);
		setTimeout(function(){
			rpio.write(12, rpio.LOW);
		},500);
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
	}
	// if(isBurning && useFlameDetector && rpio.read(17)) {
	// 	sendFireAlert();
	// } else {
	// 	isBurning = false;
	// }
}

function commandTracking(){
	// if(keyboard.indexOf("A#") > -1){
	// 	keyboard = "";
	// 	setTimeout(function() {
	// 		useThiefTracking = useThiefTracking? false : true;
	// 		if(!useThiefTracking){
	// 			isMoving = false;
	// 			alertBuzzer("P");
	// 		}
	// 		console.log("Thief dectector: "+ useThiefTracking);
	// 	}, 2000);
	// } else if(keyboard.indexOf("B#") > -1) {
	// 	keyboard = "";
	// 	useFlameDetector = useFlameDetector? false : true;
	// 	if(!useFlameDetector){
	// 		isBurning = false;
	// 		alertBuzzer("P");
	// 	}
	// 	console.log("Flame dectector: "+ useFlameDetector);
	// } else if(keyboard.indexOf("C#") > -1 && keyboard.charAt(keyboard.length -1 ) == "*") {
	// 	phoneNumber = keyboard.replace("C#", '');
	// 	phoneNumber = phoneNumber.replace("*", '');
	// 	keyboard = "";
	// } else if(keyboard.indexOf("D") > -1 && keyboard != "") {
	// 	keyboard = keyboard.substring(0, keyboard.length - 2);
	// } else 

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
	} else if(keyboard.indexOf("OK") > -1) {
		if(!isTakingPhoto){
			isTakingPhoto = true;
			takePhoto();
		}
	} else if(keyboard.indexOf("##") > -1) {
		if(!isRecording){
			isRecording = true;
			recordVideo();
		}
	} else if(keyboard.indexOf("333") > -1) {
		alertBuzzer("S");
	} else if(keyboard.indexOf("123#") > -1) {
		keyboard = "";
		isMoving = false;
		isBurning = false;
		isSOS = false;
		useFlameDetector = false;
		useThiefTracking = false;
		alertBuzzer("P");
		console.log("Keyboard cleared!");
		// console.log("Flame dectector: "+ useFlameDetector);
		// console.log("Thief dectector: "+ useThiefTracking);
	}
};



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
// };
// var cou=0;

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
  parser: SerialPort.parsers.readline('\r\n')
});

port.on('data', function (data) {
	try {
		if(data !== '' && data.startsWith("$")){
			var location = nmea.parse(data.trim());
			if(location.status === "valid" || location.fixType === "fix"){
				longtitude = convertLon(location.lon, location.lonPole);
				latitude = convertLat(location.lat, location.latPole);
				isFixedPosition = true;
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
		keyboard += data.trim().charAt(0);
		console.log(keyboard);
		commandTracking();
	}
});

// function gotData(data){
// 	var data;
// 	try {
// 		if(data !== ''){
// 			var location = nmea.parse(data.trim());
// 			if(location !== undefined){
// 				console.log(location);
// 			}
			
// 		}
// 	} catch(e) {
// 		console.log('invalid');
// 	}
// 	// var location = nmea.parse(data.trim());
// 	// console.log(location);
// };   

// serialjs.open(
//     '/dev/ttyACM0',
//     start1,
//     '\n'
// );

// function start1(port){
//     port.on(
//         'data',
//         gotData2
//     );
// 	arduino1 = port;	

// };


// function gotData2(data){
// 	if(data != '') {
// 		keyboard += data.trim().charAt(0);
// 		console.log(keyboard);
// 		commandTracking();
// 	}
// };



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
    sendVNSMS('Vi tri hien tai cua thiet bi https://www.google.com/maps/place/'+latitude+'N'+longtitude+'E', phoneNumber);
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
	isMoving = false;
	isBurning = false;
	isSOS = false;
	useFlameDetector = false;
	useThiefTracking = false;
	alertBuzzer("P");
	console.log("Keyboard cleared!");
	console.log("Flame dectector: "+ useFlameDetector);
	console.log("Thief dectector: "+ useThiefTracking);
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

