'use strict';

const {config} = require("../config");
const fsp = require("fs/promises");
const {promisify} = require("util");
const request = require("request");
const promisifiedRequest = promisify(request);


async function refreshAccessToken(userId, userInfo) {
    const refreshToken = userInfo[userId].refresh_token
    const options = {
        method: 'POST',
        url: `https://${config.domain}/oauth/token`,
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        form: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: config.clientId,
            client_secret: config.clientSecret
        }
    };
    const response = await promisifiedRequest(options);
    const parsedBody = JSON.parse(response.body);
    userInfo[userId].expiresIn = Date.now() + parsedBody.expires_in * 1000;
    userInfo[userId].accessToken = parsedBody.access_token;
    return parsedBody.access_token;
}

async function authUserByLoginAndPassword(login, password) {
    const options = {
        method: 'POST',
        url: `https://${config.domain}/oauth/token`,
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        form: {
            grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
            username: login,
            password: password,
            audience: config.audience,
            scope: 'offline_access',
            realm: 'Username-Password-Authentication',
            client_id: config.clientId,
            client_secret: config.clientSecret
        }
    };

    const response = await promisifiedRequest(options);
    const parsedBody = JSON.parse(response.body);
    return {
        accessToken: parsedBody.access_token,
        refreshToken: parsedBody.refresh_token,
        expiresIn: parsedBody.expires_in
    };
}

async function getAccessToken() {
    let appToken;
    const buffer = await fsp.readFile(`${__dirname}/app-token.json`, 'utf-8');
    const json = JSON.parse(buffer);
    if (json.dateOfExpiring > Date.now()) {
        appToken = json.access_token;
    }

    if (!appToken) {
        const options = {
            method: 'POST',
            url: `https://${config.domain}/oauth/token`,
            headers: {'content-type': 'application/x-www-form-urlencoded'},
            form:
                {
                    client_id: config.clientId,
                    client_secret: config.clientSecret,
                    audience: config.audience,
                    grant_type: 'client_credentials'
                }
        };
        const response = await promisifiedRequest(options);
        const parsedBody = JSON.parse(response.body);
        appToken = parsedBody.access_token;
        parsedBody.dateOfExpiring = (parsedBody.expires_in - 4 * 60 * 60) * 1000;
        const buffer = JSON.stringify(parsedBody);
        await fsp.writeFile(`${__dirname}/app-token.json`, buffer);
    }

    return appToken;
}

module.exports = {
    refreshAccessToken,
    authUserByLoginAndPassword,
    getAccessToken
};
