require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.static(__dirname + '/..'));
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

let waitingUsers = [];
io.on("connection", (socket) => {
    console.log("a user connected" + socket.id);
    if (waitingUsers.length >0) {
        const partner = waitingUsers.shift();
        const roomName = `room-${socket.id}-${partner.id}`;
        socket.join(roomName);
        partner.join(roomName);
        io.to(roomName).emit("match", "Match Found");
        console.log(`Matched ${socket.id} with ${partner.id} in room ${roomName}`);
    } else {
        waitingUsers.push(socket);
        io.to(socket.id).emit("wait", "Waiting for a partner");
    };
    socket.on("message", (msg) => {
        const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
        io.to(rooms[0]).emit("message", msg);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
        waitingUsers = waitingUsers.filter(user => user.id !== socket.id);


    });

    
    });
    