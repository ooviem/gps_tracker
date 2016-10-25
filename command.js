
var cp = require("child_process");
var Q = require("q");

var Command = {
    exe: function (command) {
        var deferred = Q.defer();
                    console.log("excuting");

        cp.exec(command, function (error, stdout, stderr) {
            if (error) {
                console.error('exec error:'+error);
            }
            var output = {
                error: error,
                stderr: stderr,
                stdout: stdout
            };
            deferred.resolve(output);
        });

        return deferred.promise;
    },
    
    read: function(){
        var command = "sudo stty -F /dev/ttyUSB0 ispeed 4800 && cat < /dev/ttyUSB0";
        return this.exe(command);
    },
  
};
module.exports = Command;
