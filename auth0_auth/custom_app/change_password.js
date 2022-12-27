const request = require("request");
const config = require("./config/config")
const utils = require('./utils/utils');

const token = utils.getToken();
const userId = '63a1e8f25ade362990d0cf4b';
if (token !== undefined) {
    const options = {
        method: 'PATCH',
        url: `https://${config.domain}/api/v2/users/auth0|${userId}`,
        headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            password: 'qweasdzxc123456!',
            connection: 'Username-Password-Authentication'
        })
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body);
    });
} else {
    console.log("Call request access token first")
}
