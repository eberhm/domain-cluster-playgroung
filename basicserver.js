const http = require('http');
//const numCPUs = 1;
let count = 0;

// the worker

let server = require('http').createServer(function(req, res) {


    // because req and res were created before this domain existed,
    // we need to explicitly add them.

    // Now run the handler function.

        switch(req.url) {
            case '/error':
                setTimeout(function() {
                    console.log(`Error on ${process.pid}`);
                    // this is the error
                    flerb.bark();
                });
                break;
            default:
                res.writeHead(200);
                res.end('hello world\n');
        }
});

server.listen(8000);


server.on('connection', () => console.log(`Connection made on ${process.pid}, ${++count}`));
