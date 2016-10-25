var WebServer = require("./web/server.js");
var gps = require("./command.js");
var mainFunction = function(){
   	var command = "echo B0";

    gps.exe(command).then(function(data){
    	console.log(data);
    });

}
mainFunction();
WebServer.initWebServer();
