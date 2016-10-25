var WebServer = require("./web/server.js");
var gps = require("./command.js");
var mainFunction = function(){
   	var command = "sudo stty -F /dev/ttyUSB0 ispeed 4800 && cat < /dev/tUSB0";

    gps.exe(command).then(function(data){
    	console.log(data);
    });

}
mainFunction();
WebServer.initWebServer();
