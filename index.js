var WebServer = require("./web/server.js");
var serialjs=require('serialport-js');
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

    port.send('howdy doody doo!')
}

function gotData(data){
    console.log(data);
}   

var mainFunction = function(){
   	start();
}
mainFunction();
WebServer.initWebServer();
