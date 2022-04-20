const cluster = require('cluster');
const { createClient } = require('redis');
const numCPUs = require('os').cpus().length;
const app= require("./index")



if (cluster.isMaster) {
    console.log("master");
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', function(worker, code, signal) {
    console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
    console.log('Starting a new worker');
    cluster.fork();
  });
}else{
    console.log("worker");
    app.set('port', process.env.PORT || 4003);

    var server = app.listen(app.get('port'), function() {
      debug('Express server listening on port ' + server.address().port);
      console.log('Listening on http://localhost:' + server.address().port);
    });
  
    //resuming on uncaught exception
      process.on('uncaughtException', function (err) {
    });
    const io = require('socket.io')(server)
    const pubClient = createClient({ url: "redis://localhost:6379" });
    const subClient = pubClient.duplicate();
    
    
    
    io.adapter(createAdapter(pubClient, subClient));
    
    io.on('connection', onConnected)

}