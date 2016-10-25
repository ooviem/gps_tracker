
var cp = require("child_process");
var Q = require("q");

var Command = {
    exe: function (command) {
        var deferred = Q.defer();
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
    }
    
  
};
module.exports = Command;
