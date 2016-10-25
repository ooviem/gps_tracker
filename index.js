var WebServer = require("./web/server.js");
var gps = require("./command.js");
var mainFunction = function(){
    gps.read().then(function(data){
    	console.log(gps.read());
    });

}
mainFunction();
WebServer.initWebServer();
