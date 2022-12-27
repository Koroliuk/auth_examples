const fs = require('fs')

module.exports = {
    getToken: function getToken() {
        const s = fs.readFileSync('./config/token.json');
        if (s === undefined) {
            return ''
        }
        return JSON.parse(s).token;
    },
    getAccessToken: function getAccessToken() {
        const s = fs.readFileSync('./config/user_auth_info.json');
        if (s === undefined) {
            return ''
        }
        return JSON.parse(s).access_token;
    }
    ,
    getRefreshToken: function getRefreshToken() {
        const s = fs.readFileSync('./config/user_auth_info.json');
        if (s === undefined) {
            return ''
        }
        return JSON.parse(s).refresh_token;
    }

};
