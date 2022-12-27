const request = require("request");
const config = require("./config/config")
const utils = require('./utils/utils');

const token = utils.getToken();
if (token !== undefined) {
    const options = { method: 'GET',
        url: `https://${config.domain}/api/v2/users`,
        headers: { 'Authorization': `Bearer ${token}` }
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        const users = JSON.parse(body);
        for (let user of users) {
            console.log(user)
        }
    });
} else {
    console.log("Call request access token first")
}
