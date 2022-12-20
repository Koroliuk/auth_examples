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
