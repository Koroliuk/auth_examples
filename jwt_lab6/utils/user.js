'use strict';

const {config} = require("../config");
const {promisify} = require("util");
const request = require("request");
const promisifiedRequest = promisify(request);

async function registerUser(appToken, login, password, name, nickname) {
    const options = {
        method: 'POST',
        url: `https://${config.domain}/api/v2/users`,
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${appToken}`
        },
        body: {
            email: login,
            name: name,
            connection: 'Username-Password-Authentication',
            password: password,
            nickname: nickname
        },
        json: true
    };

    const response = await promisifiedRequest(options);
    return response.statusCode === 201;
}

async function getUserDetailedInformation(userId, accessToken) {
    const options = {
        method: 'GET',
        url: `https://${config.domain}/api/v2/users/${userId}`,
        headers: {
            'authorization': `Bearer ${accessToken}`
        }
    };
    const response = await promisifiedRequest(options);
    return JSON.parse(response.body);
}

module.exports = {
    registerUser,
    getUserDetailedInformation
};
