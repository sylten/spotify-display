const request = require("request");

const client_id = '474f87fbed1b42e8a9565e36cd84ac7c';
const client_secret = '094b7119a33447cf8554811a1baceaf4';

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
