const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;
//const numCPUs = 1;
let count = 0;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    cluster.on('fork', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} just forked!`);
    });

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });

    cluster.on('disconnect', function(worker) {
        console.error('disconnecting ' + worker.process.pid);
        cluster.fork();
    });
} else {




    // the worker
    let domain = require('domain');

    let server = require('http').createServer(function(req, res) {
        let d = domain.create();
        d.on('error', function(er) {

            // note: we're in dangerous territory now!
            try {
                // try to send an error to the request that triggered the problem
                res.statusCode = 200;
                res.setHeader('content-type', 'text/plain');
                res.end('Oops, there was a problem!\n');

                // let the master know we're through.  This will trigger a
                // 'disconnect' in the cluster master, and then it will fork
                // a new worker.
                cluster.worker.disconnect();

                // stop taking new requests.
                server.close(function() {
                    console.error('server no longer listening');
                });


                let interval = setInterval(() => {
                    server.getConnections(function(err, count) {
                        if (!count) {
                            process.exit(1);
                        }
                    });
                }, 500);


            } catch (er2) {
                // oh well?
                console.error('Error sending 500!', er2.stack);
            }
        });

        // because req and res were created before this domain existed,
        // we need to explicitly add them.
        d.add(req);
        d.add(res);

        // Now run the handler function.
        d.run(function() {
            switch(req.url) {
                case '/error':
                    setTimeout(function() {
                        console.log(`Error on ${process.pid}`);
                        // this is the error
                        flerb.bark();
                    });
                    break;
                default:
                    setTimeout(() => {
                        res.writeHead(200);
                        res.end('hello world\n');
                    }, 300);
            }
        });
    });
    server.listen(8000);


    server.on('connection', () => console.log(`Connection made on ${process.pid}, ${++count}`));

    console.log(`Worker ${process.pid} started`);
}