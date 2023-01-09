'use strict';

const jwt = require('jsonwebtoken');
const fs = require("fs");
const {config} = require("../config");
const {promisify} = require("util");
const request = require("request");
const promisifiedRequest = promisify(request);

async function getPublicKey() {
    if (!fs.existsSync('public.key')) {
        const {body: publicKey} = await promisifiedRequest(`https://${config.domain}/pem`);
        await fs.promises.writeFile('public.key', publicKey, 'utf-8');
        return publicKey;
    }
    return await fs.promises.readFile('public.key', 'utf-8');
}

async function verifyToken(token) {
    try {
        const publicKey = await getPublicKey();
        const verifyOptions = {
            issuer: `https://${config.domain}/`,
            audience: config.audience,
            algorithms: ['RS256'],
        };
        return jwt.verify(token, publicKey, verifyOptions);
    } catch (e) {
        return null;
    }
}

module.exports = {
    verifyToken
};
