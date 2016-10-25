var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");
module.exports = {
    initWebServer: function() {
        port = process.argv[2] || 2209;
        http.createServer(function(request, response) {
            var uri = url.parse(request.url).pathname,
                filename = path.join(process.cwd()+"/web/", uri);



            if (fs.statSync(filename).isDirectory()) filename += '/index.html';

            fs.readFile(filename, "binary", function(err, file) {
                if (err) {
                    response.writeHead(500, {
                        "Content-Type": "text/plain"
                    });
                    response.write(err + "\n");
                    response.end();
                    return;
                }

                response.writeHead(200);
                response.write(file, "binary");
                response.end();
            });

        }).listen(parseInt(port, 10));

        console.log("Controller running at\n  => http://localhost/");
    }
};
