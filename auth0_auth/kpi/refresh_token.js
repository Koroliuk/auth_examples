const request = require("request");
const config = require("./config/config")
const refreshToken = require('./utils/utils');
const fs = require("fs");

if (refreshToken !== undefined) {
    const options = {
        method: 'POST',
        url: `https://${config.domain}/oauth/token`,
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        form:
            {
                grant_type: 'refresh_token',
                client_id: `${config.clientId}`,
                client_secret: `${config.clientSecret}`,
                refresh_token: refreshToken
            }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        const parsedBody = JSON.parse(body);
        saveAccessToken(parsedBody.access_token);
        console.log(body);
    });
} else {
    console.log("Authorize first")
}

function saveAccessToken(accessToken) {
    const auth_info = {
        access_token: accessToken,
        refreshToken: refreshToken
    }
    fs.writeFileSync('./config/user_auth_info.json', JSON.stringify(auth_info), 'utf-8');
}
