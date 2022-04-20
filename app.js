const express = require('express')
const cluster = require("cluster");
const http = require("http");
const { Server } = require("socket.io");
const numCPUs = require("os").cpus().length;
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");
const path = require('path');
const { createClient } =require("redis");
// const { createAdapter }= require("@socket.io/redis-adapter");
const { resolve } = require('path');
const app = express()
const cors=require("cors")
app.use(cors({
  origin:"*"
}))
// const PORT = process.env.PORT || 4000
// const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`))

// const io = require('socket.io')(server)

// app.use(express.static(path.join(__dirname, 'public')))
// const { createClient } =require("redis");
// const { createAdapter }= require("@socket.io/redis-adapter");
// const {Emitter}=require("@socket.io/redis-emitter")

// const pubClient = createClient({ url: "redis://localhost:6379" });
// const subClient = pubClient.duplicate();

// io.adapter(createAdapter(pubClient, subClient));
if(cluster.isMaster){
// if(false){
  console.log(`Master ${process.pid} is running`);
  const httpServer = http.createServer();

  setupMaster(httpServer, {
    loadBalancingMethod: "least-connection",
  });

  cluster.setupMaster({
    serialization: "advanced",
  });

  httpServer.listen(4000,()=>console.log("running on 4000"));  

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });


} else{
  console.log(`Worker ${process.pid} started`);
  const httpServer = http.createServer();
  var onListening = () => {
		var addr = httpServer.address();
		var bind = typeof addr === 'string' ?
			'pipe ' + addr :
			'port ' + addr.port;
		debug('Listening on ' + bind);
		console.log('Listening on http://localhost:' + addr.port);
	}
	httpServer.on('listening', onListening);
  const io = new Server(httpServer);
  // io.adapter(createAdapter());
  // setupWorker(io);
  // io.on('connection', onConnected)

  const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();



io.adapter(createAdapter(pubClient, subClient));

io.on('connection', onConnected)

}





function onConnected(socket) {
  console.log('Socket connected', socket.id,process.pid)

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id)
  })

  socket.on('message', async(data) => {
    let msg=await delay(data)
    console.log(msg,process.pid);
    cluster.worker.kill()
    // sct.broadcast.emit('chat-message', data)
  })

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data)
  })
}
const delay=(d)=>new Promise((rs,rj)=>{
  setTimeout(() => {
    rs(d)
  }, 1000);
})
