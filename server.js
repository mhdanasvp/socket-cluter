const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 4002
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`))

const io = require('socket.io')(server)


const socketCli = require("socket.io-client");
const sct = socketCli.io("http://localhost:2233",{
  Upgrade:"websocket"
});

sct.on("connect_error", (err) => {
  console.log(`connect_error due to ${err.message}`);
});
sct.on("connect", () => {
    console.log(sct.id); // x8WIv7-mJelg7on_ALbx
  });





sct.on('connect', onConnected)


function onConnected() {
  const engine = sct.io.engine;
  console.log(engine.transport.name);
  // abcd(sct)


}

const abcd=(s)=>{
  return setInterval(() => {
    console.log("send");
    s.emit("message",{name:"anas"})
  }, 1000);
}

