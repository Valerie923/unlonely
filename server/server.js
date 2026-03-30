require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let chatSessions = {};
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    systemInstruction: "You are a warm-up companion for someone about to have a deep conversation with a stranger using the 36 Questions to Fall in Love research. Your job is to gently ease their anxiety, get them comfortable opening up, and prepare them emotionally. Ask them one simple question at a time. Be brief, warm, and human. Never sound like a bot."
});
const express = require('express');
const app = express();
app.use(express.static(__dirname + '/..'));
app.use(express.json());

app.post("/ai-chat", async (req, res) => {      
    const { message, sessionId } = req.body;

    try {
        if (!chatSessions[sessionId]) {
            chatSessions[sessionId] = model.startChat({
                history: []
            });
        }

        const chat = chatSessions[sessionId];
        const result = await chat.sendMessage(message);
        const reply = result.response.text();

        res.json({ reply });

    } catch (error) {
        console.error("Error generating AI response:", error);
        res.status(500).json({ error: "Failed to generate AI response" });
    }
});
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
        socket.to(rooms[0]).emit("message", msg);
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
        waitingUsers = waitingUsers.filter(user => user.id !== socket.id);


    });

    
    });
    