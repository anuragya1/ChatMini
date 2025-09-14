import express from 'express';
import { Server } from 'socket.io';
import http from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const app = express();

// this to make the socket.io and express to coexist together in the same server
const server = http.createServer(app)

const io=new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// middleware to parse json 
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// socket io 
io.on("connection", (socket) => {
    // listen for event message from client 
  socket.on('message',message=>{
    console.log('new user message', message);
    
    //broadcast to the incoming messages to all connected clients
    io.emit('message',message);
  })
});

app.get('/', async (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
})

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
})


