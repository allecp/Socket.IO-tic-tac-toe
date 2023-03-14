
const express = require('express');
const app = express();
const http = require('http');
const httpServer = http.createServer(app);
const { Server } = require("socket.io"); // Server is a class
const cors = require('cors'); 
const { env } = require('process');



app.use(cors()); // .use() takes in middleware functions. cors({origin: *,...}) is the default settings of cors which takes in no argument


const io = new Server(httpServer,{ // socket io server needs http server 
    cors: {
      origin: "http://localhost:3000"
    }
  });

io.on('connection',(socket) => {

    //console.log(io);
    console.log(`Soccet ${socket.id} connected\n`);

    socket.on("disconnecting", () => {
      let rooms = socket.rooms.values();
      let i = 0; 

      while (i++ < socket.rooms.size){
          let room = rooms.next().value;
          
          if (room != socket.id) // socket.rooms is a set that contains {id,...rooms}
            socket.to(room).emit("opp-left-room",`${socket.playerName}`);
      }
    });

    socket.on('leave-room',(room) => {
        socket.to(room).emit("opp-left-room",`${socket.playerName}`); // signals to other player in room that opp left
        console.log(`${socket.id} is leaving room ${room}. Connection in-tact`)
        socket.leave(room);
    })

  socket.on("disconnect",() => {
    console.log(`Socket ${socket.id} has disconnected\n`); // this event is fired when the tab is closed or refreshed 
  })

  socket.on("check-room-capacity",(room) => {
      let tempRoom = io.sockets.adapter.rooms.get(room); 
      console.log(room);

      if (!tempRoom || tempRoom.size <= 1){
          io.to(socket.id).emit("room-size",false,room);
          return;
      }
      console.log("server-side:room is full");
      io.to(socket.id).emit("room-size",true,room);

  })

  socket.on("join-room",(room) => {
      
    if (!io.sockets.adapter.rooms.has(room)){
        console.log("first in room");
        io.to(socket.id).emit('set-symbol','X');
        socket.join(room);
    }
    else{
        socket.join(room);
        console.log("second in room");
        io.to(socket.id).emit('set-symbol','O');
        io.in(room).emit("opp-joined-game",socket.id);
        io.in(room).emit("set-turn","X");
    }

    console.log(`${socket.id} has joined room ${room}\n`);
  })

  socket.on("turn-change",(data) =>{
      //console.log(data);
      io.in(data.room).emit("turn-change",data.newTurn)
  })

  socket.on("rematch",(room) => {
      io.in(room).emit("rematch")
  })

  socket.on("board-change", (data) => {
      console.log(data.newBoard);
      io.in(data.room).emit("board-change",data.newBoard);
  })

});

httpServer.listen(3001, () => {
  console.log('listening on *:3001');
});