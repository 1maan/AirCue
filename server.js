require('dotenv').config({
    quiet: true
});
const app = require('./app');
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);




io.on('connection', (socket) => {
    socket.on('sentStory', (data)=>{
        socket.broadcast.emit('recStory', data)
    })
    socket.on('updateRunOrders', (data)=>{
        socket.broadcast.emit('updateSentRunOrders', data)
    })
    socket.on('activeRunOrder', (data)=>{
        socket.broadcast.emit('rundownUpdated', data)
    })
    socket.on('updateRunDown', (data)=>{
        socket.broadcast.emit('updateRunDownUser', data)
    })    
    socket.on('tele-settings', (data)=>{
        console.log(data)
        socket.broadcast.emit('tele-settings-update', data)
    })
});





const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Listening on PORT ${PORT}`);
});