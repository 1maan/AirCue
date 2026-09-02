require('dotenv').config({
    quiet: true
});
const app = require('./app');
const db = require('./config/db');
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
        socket.broadcast.emit('tele-settings-update', data)
    })
    socket.on("tele-jump", async (data) => {
        const userIp = socket.handshake.address.replace("::ffff:", "");
        const matched = await ipMatch(userIp);
        if (!matched) {
            console.log("IP not allowed:", userIp);
            return;
        }
        console.log("IP matched:", userIp);
        socket.broadcast.emit("tele-jump-to", data);
    });

    socket.on("reload-tele", async (data) => {
        socket.broadcast.emit("tele-reload", data);
    });


});

function ipMatch(userIp) {
    const sql = `
        SELECT graphics_ip
        FROM settings
        WHERE graphics_ip = ?
        LIMIT 1
    `;
    return new Promise((resolve) => {
        db.query(sql, [userIp], (err, result) => {
            if (err) {
                console.error(err);
                return resolve(false);
            }
            resolve(result.length > 0);
        });
    });
}



const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
    console.log(`Listening on PORT ${PORT}`);
});