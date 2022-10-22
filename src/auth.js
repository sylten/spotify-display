const request = require("request");

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

let token = null;
let expirationTimestamp = 0;

function authenticate(callback, err) {
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            console.log("New token fetched", body);
            callback(body);
        }
        else if (error) {
            console.err(error);
            err(error);
        }
        else {
            console.log(response);
            console.log(body);
            err({response,body});
        }
    });
}

function timestamp() {
    return new Date().getTime();
}

function isExpired() {
    if (!token) {
        return true;
    }

    const now = timestamp();
    if (now > expirationTimestamp - 1000*60) {
        return true;
    }

    return false;
}

module.exports = {
    getToken: function() {
        return new Promise((resolve, reject) => {
            if (!isExpired()) {
                return resolve(token.access_token);
            }
    
            authenticate((_token) => {
                token = _token;
                expirationTimestamp = timestamp() + token.expires_in * 1000;
                resolve(token.access_token);
            }, error => reject(error));
        });
    }
}
