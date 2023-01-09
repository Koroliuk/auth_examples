'use strict';

const {config} = require("../config");
const {promisify} = require("util");
const request = require("request");
const promisifiedRequest = promisify(request);

async function getUserAccessTokenByCode(code) {
    const options = {
        method: 'POST',
        url: `https://${config.domain}/oauth/token`,
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        form: {
            grant_type: 'authorization_code',
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code: code,
            redirect_uri: 'http://localhost:3000'
        }
    };
    const response = await promisifiedRequest(options);
    const parseBody = JSON.parse(response.body);
    return {
        accessToken: parseBody.access_token,
        expiresIn: parseBody.expires_in,
        refreshToken: parseBody.refresh_token,
    };
}

module.exports = {
    getUserAccessTokenByCode
};
