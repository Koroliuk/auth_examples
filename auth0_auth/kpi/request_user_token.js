const request = require("request");
const fs = require("fs");
const config = require("./config/config")

const options = {
    method: 'POST',
    url: `https://${config.domain}/oauth/token`,
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    form: {
        grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
        username: 'yaroslav.koroliuk.ip.94@gmail.com',
        password: 'qwerty123!!',
        audience: `${config.audience}`,
        scope: 'offline_access',
        realm: 'Username-Password-Authentication',
        client_id: `${config.clientId}`,
        client_secret: `${config.clientSecret}`
    }
};

request(options, function (error, response, body) {
    if (error) throw new Error(error);

    const parsedBody = JSON.parse(body);
    const auth_info = {
        access_token: parsedBody.access_token,
        refresh_token: parsedBody.refresh_token
    }
    saveAuthInfo(auth_info);
    console.log(body)
});

function saveAuthInfo(obj) {
    fs.writeFileSync('./config/user_auth_info.json', JSON.stringify(obj), 'utf-8');
}
