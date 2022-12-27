const fs = require('fs')

function getToken() {
    const s = fs.readFileSync('./config/token.json');
    if (s === undefined) {
        return ''
    }
    return JSON.parse(s).token;
}

const token = getToken();
module.exports = token;

function getAccessToken() {
    const s = fs.readFileSync('./config/user_auth_info.json');
    if (s === undefined) {
        return ''
    }
    return JSON.parse(s).access_token;
}

function getRefreshToken() {
    const s = fs.readFileSync('./config/user_auth_info.json');
    if (s === undefined) {
        return ''
    }
    return JSON.parse(s).refresh_token;
}

const accessToken = getAccessToken();
const refreshToken = getRefreshToken();
module.exports = accessToken;
module.exports = refreshToken;
