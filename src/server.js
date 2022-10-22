require('dotenv').config();
const axios = require("axios");
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const { getToken } = require('./auth');

const PORT = 8787;

const EventType = {
    Playing: "playing",
    Changed: "changed",
    Paused: "paused",
    Start: "start",
    Stop: "stop"
};

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

    console.log("event:"+eventType+"/"+trackId);

    if (eventType === EventType.Start || eventType === EventType.Changed || eventType === EventType.Playing) {
        const token = await getToken();
        const response = await axios(`https://api.spotify.com/v1/tracks/${trackId}`, { headers: { "Authorization": "Bearer " + token } });
        console.log(response.data.name)
        io.emit(eventType, response.data);
        lastTrack = response.data;
    }
    
    res.status(204).send();
});

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
