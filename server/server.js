require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const path = require('path');
let chatSessions = {};


const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash-lite",
    systemInstruction: `

You are a casual, friendly person chatting with someone while waiting to be matched with a stranger.

Your style:
- Sound like a normal young person, not a therapist
- Keep messages short (1 sentence, max 2)
- Be slightly informal (it's okay to say "haha", "hmm", etc.)
- Do NOT sound deep, intense, or overly emotional
- Do NOT ask heavy or personal questions
- Avoid phrases like "what makes you feel..." or "tell me more about..."

Conversation goal:
- Help the user feel less awkward while waiting
- Keep things light, easy, and natural
- Ask simple, low-pressure questions (e.g. hobbies, random stuff, daily life)

Good examples:
- "oh nice haha, what do you usually do when you're bored?"
- "hmm same tbh, are you more introvert or extrovert?"
- "lol making friends is hard nowadays, where are you from?"

Bad examples:
- "What qualities do you look for in a friend?"
- "What is making you feel lonely today?"
- Anything that sounds like therapy

Important:
- Do NOT escalate emotional intensity
- Match the user's tone (if they are casual, be casual)
- If they say something vulnerable, acknowledge briefly and move on naturally

You are NOT a counselor. You are just a normal person chatting.

`
});
const express = require('express');
const app = express();
app.use(express.static(path.join(__dirname, '..')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});


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
    socket.on("partner_left", () => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    if (rooms.length > 0) {
        socket.to(rooms[0]).emit("partner_left");
    }
    });
    socket.on("next_question", () => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    if (rooms.length > 0) {
        socket.to(rooms[0]).emit("next_question");
    }
    });
    socket.on("continue_set", () => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    if (rooms.length > 0) {
        socket.to(rooms[0]).emit("continue_set");
    }
    });

    socket.on("join_room", (roomName) => {
    socket.join(roomName);
    });
    console.log("a user connected" + socket.id);
    if (waitingUsers.length >0) {
        const partner = waitingUsers.shift();
        const roomName = `room-${socket.id}-${partner.id}`;
        socket.join(roomName);
        partner.join(roomName);
        io.to(roomName).emit("match", roomName);
        console.log(`Matched ${socket.id} with ${partner.id} in room ${roomName}`);
    } else {
        waitingUsers.push(socket);
        io.to(socket.id).emit("wait", "Waiting for a partner");
    };
    socket.on("message", (msg) => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    if (rooms.length > 0) {
        socket.to(rooms[0]).emit("message", msg);
    }
});

   socket.on("disconnect", () => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    if (rooms.length > 0) {
        socket.to(rooms[0]).emit("partner_left");
    }
    waitingUsers = waitingUsers.filter(user => user.id !== socket.id);
});


    
    });
    