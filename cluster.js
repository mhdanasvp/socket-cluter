const express=require("express")

const app=express()

// const cors=require("cors")
// app.use(cors({
//   origin:"http://localhost:4002",
//   credentials:true
// }))
const cluster=require("cluster");
const numCPUs = require("os").cpus().length;
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");


if(cluster.isMaster){
    for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}
    cluster.on('exit', function(worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
      });

} else {
    const server=app.listen(2233,()=>console.log("running on 2233"))
    const io = require('socket.io')()
    const pubClient = createClient({ host: "redis://localhost",port:6379 });
    const subClient = pubClient.duplicate();

    pubClient.on('connect', () => {
        console.log('Client connected to redis...')
    })

    io.adapter(createAdapter(pubClient, subClient));

    io.on('connection', onConnected)
    io.listen(server)

}
function onConnected(socket) {
    console.log('Socket connected', socket.id,process.pid)
  
    socket.on('disconnect', () => {
      console.log('Socket disconnected', socket.id)
    })

  socket.on('message', async (data) => {
    // let msg=await delay(data)
    // console.log(msg);

    console.log(data, process.pid);
    let response = {
      message: "response",
      data
    }
    socket.emit('chat-message', response)
  })

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data)
  })

  }



