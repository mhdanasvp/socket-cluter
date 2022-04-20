const express = require('express')
const app = express()
const cors=require("cors")
// app.use(cors({
//   origin:"*"
// }))
const PORT = process.env.PORT || 4006
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`))

const io = require('socket.io')(server)

const { createClient } =require("redis");
const { createAdapter }= require("@socket.io/redis-adapter");

const pubClient = createClient({ url: "redis://localhost:6379" });
const subClient = pubClient.duplicate();



io.adapter(createAdapter(pubClient, subClient));

io.on('connection', onConnected)




function onConnected(socket) {
  console.log('Socket connected', socket.id,process.pid)

  socket.on('disconnect', () => {
    console.log('Socket disconnected', socket.id)
  })

  socket.on('message', async(data) => {
    // let msg=await delay(data)
    // console.log(msg);
    // sct.broadcast.emit('chat-message', data)

    console.log(data);
  })

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data)
  })
}
const delay=(d)=>new Promise((rs,rj)=>{
  setTimeout(() => {
    rs(d)
  }, 2000);
})


 module.exports=app
