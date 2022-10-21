// //const cors = require('cors');
// const express = require('express');
// const http = require('http');

// const { Server } = require("socket.io");
// const { getToken } = require('./auth');
// const app = express();
// const PORT = 8787;

// const server = http.createServer(app);
// const io = new Server(server);

// io.on('connection', (socket) => {
//     console.log('a user connected');
// });

const EventType = {
    Playing: "playing",
    Changed: "changed",
    Paused: "paused",
    Start: "start",
    Stop: "stop"
};

// //app.use(cors({ origin: 'http://localhost:3000' }));
// app.use(express.json());
// app.use(express.static(__dirname + '/public'));

// app.get('/event', async(req, res) => {
//     const eventType = req.query.type;
//     const trackId = req.query.track;

//     if (eventType === EventType.Start) {
//         const token = await getToken();
//         const response = await axios(`https://api.spotify.com/v1/tracks/${trackId}`, { headers: { "Authorization": "Bearer " + token } });

//         io.emit({
//             event: eventType,
//             data: response.data
//         });
//     }
    
//     res.statusCode(204).send();
// });

// server.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));

const axios = require("axios");
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { getToken } = require('./auth');

const PORT = 8787;

app.use(express.static(__dirname + '/public'));

let lastTrack = null;

io.on('connection', (socket) => {
    console.log('user connected');
    
    if (lastTrack) {
        io.emit("start", lastTrack);
    }

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

app.get('/event', async(req, res) => {
    const eventType = req.query.type;
    const trackId = req.query.track;

    if (eventType === EventType.Start || eventType === EventType.Changed || eventType === EventType.Playing) {
        const token = await getToken();
        const response = await axios(`https://api.spotify.com/v1/tracks/${trackId}`, { headers: { "Authorization": "Bearer " + token } });

        io.emit(eventType, response.data);
        lastTrack = response.data;
    }
    
    res.status(204).send();
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
