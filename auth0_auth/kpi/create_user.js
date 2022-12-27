const request = require("request");
const config = require("./config/config")
const utils = require("./utils/utils");

const token = utils.getToken();
if (token !== undefined) {
    const options = { method: 'POST',
        url: `https://${config.domain}/api/v2/users`,
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body:
            {
                email: 'yaroslav.koroliuk.ip.94@gmail.com',
                name: 'Yaroslav Koroliuk IP-94',
                connection: 'Username-Password-Authentication',
                password: 'qwerty123!!'
            },
        json: true
    };

    request(options, function (error, response, body) {
        if (error) throw new Error(error);

        console.log(body)
    });
} else {
    console.log("Call request access token first")
}
