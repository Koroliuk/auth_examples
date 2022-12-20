const request = require("request");
const fs = require('fs');
const config = require("./config/config")

const options = {
    method: 'POST',
    url: `https://${config.domain}/oauth/token`,
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    form:
        {
            client_id: `${config.clientId}`,
            client_secret: `${config.clientSecret}`,
            audience: `${config.audience}`,
            grant_type: 'client_credentials'
        }
};

request(options, function (error, response, body) {
    if (error) throw new Error(error);

    saveToken(JSON.parse(body).access_token);
    console.log(body)
});

function saveToken(accessToken) {
    const json = {token: accessToken}
    fs.writeFileSync('./config/token.json', JSON.stringify(json), 'utf-8');
}
