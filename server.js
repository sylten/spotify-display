//const cors = require('cors');
const express = require('express');
const app = express();
const PORT = 8787;


//app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.get('/event', (req, res) => {
    const eventType = req.query.type;
    const trackId = req.query.track;
    
    res.statusCode(204).send();
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
