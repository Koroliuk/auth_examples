const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require("fs");
const {logger} = require("./logger.js");
const request = require("request");
const {auth} = require('express-oauth2-jwt-bearer');
const {promisify} = require('util');
const config = require("../auth0_auth/kpi/config/config");
const uuid = require("uuid");
const promisifiedRequest = promisify(request);


const PORT = 3000;
const AUTHORIZATION = 'Authorization';
const BLOCKING_TIME = 2 * 60 * 1000;
const TIME_RANGE_TO_CHECK = 5000;
const loginHistory = {};
const userSub2RefreshToken = {}


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(async (req, res, next) => {
    let token = undefined;
    if (req.get(AUTHORIZATION) !== undefined) {
        token = req.get(AUTHORIZATION).split(" ")[1];
    }
    console.log(token);
    console.log();
    const payload = await verifyToken(token);
    if (payload) {
        const tokenValidTimeInMsec = userSub2RefreshToken[payload.sub].expires_in - 86350 * 1000;
        if (Date.now() >= tokenValidTimeInMsec) {
            const refresh_token = userSub2RefreshToken[payload.sub].refresh_token
            const options = {
                method: 'POST',
                url: `https://dev-ciqz1vdq1irife3n.us.auth0.com/oauth/token`,
                headers: {'content-type': 'application/x-www-form-urlencoded'},
                form: {
                    grant_type: 'refresh_token',
                    refresh_token: refresh_token,
                    client_id: `mdfALuYL914gp5lqPsoOWaIgh8gtMyXq`,
                    client_secret: `wRBB9kua92GDaDTNXsLPhUMSaKKwcu7UCYCtVvEIsVopLLBLGJzosBeWgAU-JEDx`
                }
            };
            const responce = await promisifiedRequest(options);
            const parsedBody = JSON.parse(responce.body);
            token = parsedBody.access_token;
            userSub2RefreshToken[payload.sub].expires_in = Date.now() + parsedBody.expires_in * 1000;
        }
        req.token = token
        req.userInfo = payload;
    }
    next();
});

const checkJwt = auth({
    audience: 'https://dev-ciqz1vdq1irife3n.us.auth0.com/api/v2/',
    issuerBaseURL: `https://dev-ciqz1vdq1irife3n.us.auth0.com`,
});

app.get('/', async (req, res) => {
    const queryParams = req.query;
    if (queryParams && queryParams.code && queryParams.state &&
        queryParams.state.includes("login-example")) {
        try {
            const {code} = queryParams;
            const options = {
                method: 'POST',
                url: `https://dev-ciqz1vdq1irife3n.us.auth0.com/oauth/token`,
                headers: {'content-type': 'application/x-www-form-urlencoded'},
                form: {
                    grant_type: 'authorization_code',
                    client_id: `mdfALuYL914gp5lqPsoOWaIgh8gtMyXq`,
                    client_secret: `wRBB9kua92GDaDTNXsLPhUMSaKKwcu7UCYCtVvEIsVopLLBLGJzosBeWgAU-JEDx`,
                    code: code,
                    redirect_uri: 'http://localhost:3000'
                }
            };
            const response = await promisifiedRequest(options);
            const responce = JSON.parse(response.body);
            const auth_info =  {
                access_token: responce.access_token,
                expires_in: responce.expires_in,
                refresh_token: responce.refresh_token,
            };

            const ip = req.socket.remoteAddress;
            const payload = await verifyToken(auth_info.access_token);
            logger.info(`Successfully logged in, IP: ${ip}, user: ${auth_info.login}`);
            const parsedBody = {}
            parsedBody.refresh_token = auth_info.refresh_token;
            parsedBody.expires_in = Date.now() + auth_info.expires_in * 1000;
            userSub2RefreshToken[payload.sub] = parsedBody;
            let token = auth_info.access_token;
            res.setHeader('AccessToken', token);
        } catch {}
    } else {
        const {userInfo} = req;
        const {token} = req;
        if (token) {
            return res.json({
                token: token,
                username: "sdfsdfsdfsdfsdfsd"
            });
        }
    }
    return res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/userinfo', checkJwt, function (req, res) {
    const {token} = req;
    if (token) {
        const message = {
            name: userSub2RefreshToken[req.userInfo.sub].name,
            email: userSub2RefreshToken[req.userInfo.sub].email,
            phone_number: userSub2RefreshToken[req.userInfo.sub].phone_number
        }
        res.json({
            token: token,
            message: JSON.stringify(message)
        });
    }
});

app.get('/logout', (req, res) => {
    delete userSub2RefreshToken[req.userInfo.sub];
    res.redirect('/');
});

app.post('/api/login', async (req, res) => {
    const {login, password} = req.body;

    const options = {
        method: 'POST',
        url: `https://dev-ciqz1vdq1irife3n.us.auth0.com/oauth/token`,
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        form: {
            grant_type: 'http://auth0.com/oauth/grant-type/password-realm',
            username: login,
            password: password,
            audience: `https://dev-ciqz1vdq1irife3n.us.auth0.com/api/v2/`,
            scope: 'offline_access',
            realm: 'Username-Password-Authentication',
            client_id: `mdfALuYL914gp5lqPsoOWaIgh8gtMyXq`,
            client_secret: `wRBB9kua92GDaDTNXsLPhUMSaKKwcu7UCYCtVvEIsVopLLBLGJzosBeWgAU-JEDx`
        }
    };

    const response = await promisifiedRequest(options);
    const parsedBody = JSON.parse(response.body);
    let auth_info = {
        access_token: parsedBody.access_token,
        refresh_token: parsedBody.refresh_token,
        expires_in: parsedBody.expires_in
    };

    const ip = req.socket.remoteAddress;
    if (auth_info.access_token !== undefined && !checkIfBlocked(ip)) {
        const payload = await verifyToken(auth_info.access_token);
        logger.info(`Successfully logged in, IP: ${ip}, user: ${auth_info.login}`);
        const options1 = {
            method: 'GET',
            url: `https://dev-ciqz1vdq1irife3n.us.auth0.com/api/v2/users/${payload.sub}`,
            headers: {
                'authorization': `Bearer ${auth_info.access_token}`
            }
        };
        const response = await promisifiedRequest(options1);
        const parsedBody = JSON.parse(response.body);
        parsedBody.refresh_token = auth_info.refresh_token;
        parsedBody.expires_in = Date.now() + auth_info.expires_in * 1000;
        userSub2RefreshToken[parsedBody.user_id] = parsedBody;
        let token = auth_info.access_token;
        return res.json({token: token});
    } else {
        saveUnsuccessfulAttempt(ip);
        logger.info(`Unsuccessful attempt to login from IP: ${ip}`);
    }

    return res.status(401).send();
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname + '/signup.html'));
});

app.post('/api/signup', async (req, res) => {
    const {login, password, name, nickname} = req.body;

    const options = {
        method: 'POST',
        url: `https://dev-ciqz1vdq1irife3n.us.auth0.com/oauth/token`,
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        form:
            {
                client_id: `mdfALuYL914gp5lqPsoOWaIgh8gtMyXq`,
                client_secret: `wRBB9kua92GDaDTNXsLPhUMSaKKwcu7UCYCtVvEIsVopLLBLGJzosBeWgAU-JEDx`,
                audience: `https://dev-ciqz1vdq1irife3n.us.auth0.com/api/v2/`,
                grant_type: 'client_credentials'
            }
    };

    const response = await promisifiedRequest(options);
    const accessTokenClient = JSON.parse(response.body).access_token;

    const options1 = {
        method: 'POST',
        url: `https://dev-ciqz1vdq1irife3n.us.auth0.com/api/v2/users`,
        headers: {
            'content-type': 'application/json',
            'Authorization': `Bearer ${accessTokenClient}`
        },
        body: {
            email: login,
            name: name,
            connection: 'Username-Password-Authentication',
            password: password,
            nickname : nickname
        },
        json: true
    };

    const response1 = await promisifiedRequest(options1);
    if (response1.statusCode === 201) {
        logger.info(`Successfully registered user with login ${login}`);
        return res.json({redirect: '/'});
    }
    return res.status(500).send();
});

app.get('/login', async (req, res) => {
    // todo: add state with uuid.v4()
    const config = {}
    config.domain ="dev-ciqz1vdq1irife3n.us.auth0.com";
    config.clientId = "mdfALuYL914gp5lqPsoOWaIgh8gtMyXq";
    config.audience = "https://dev-ciqz1vdq1irife3n.us.auth0.com/api/v2/"
    config.state = "login-example";
    // const id = uuid.v4();
    const id = "";
    res.redirect(`https://${config.domain}/authorize?response_type=code&client_id=${config.clientId}&redirect_uri=http://localhost:3000&scope=offline_access&audience=${config.audience}&state=${config.state}-${id}`);
});


app.listen(PORT, () => {
    logger.info(`Example app listening on port ${PORT}`);
});

function checkIfBlocked(ip) {
    if ((ip in loginHistory) && loginHistory[ip].attempts.length > 1) {
        if (loginHistory[ip].status === 'Blocked' && new Date() > loginHistory[ip].blockingEndTime) {
            loginHistory[ip].status = 'Allowed';
            return false;
        }
        logger.info(`Log in attempt is blocked for IP: ${ip}`);
        return true;
    }
    return false;
}

function saveUnsuccessfulAttempt(ip) {
    if (!(ip in loginHistory)) {
        loginHistory[ip] = {
            status: 'Allowed',
            attempts: []
        };
    }

    if (!(loginHistory[ip].status === 'Blocked')) {
        loginHistory[ip].attempts.push(new Date());
    }

    if (loginHistory[ip].attempts.length > 1) {
        const curr = loginHistory[ip].attempts.at(-1);
        const prev = loginHistory[ip].attempts.at(-2);
        if ((curr.getTime() - prev.getTime()) / 1000 / 60 < TIME_RANGE_TO_CHECK && loginHistory[ip].status === 'Allowed') {
            loginHistory[ip].status = 'Blocked';
            loginHistory[ip].blockingEndTime = new Date(new Date().getTime() + BLOCKING_TIME);
            logger.info(`2 unsuccessful log in attempts in 5 minutes for IP: ${ip}. Block time 2 min.\n
             Further login attempts before the lockout time expires will be ignored`);
        }
    }
}

const getPublicKey = async () => {
    if (!fs.existsSync('public.key')) {
        const {body: publicKey} = await promisifiedRequest(`https://dev-ciqz1vdq1irife3n.us.auth0.com/pem`);

        await fs.promises.writeFile('public.key', publicKey, 'utf-8');
        return publicKey;
    }

    return await fs.promises.readFile('public.key', 'utf-8');
};

async function verifyToken(token) {
    try {
        //todo: get rid of redundant calls
        const publicKey = await getPublicKey();
        const verifyOptions = {
            issuer: `https://dev-ciqz1vdq1irife3n.us.auth0.com/`,
            audience: `https://dev-ciqz1vdq1irife3n.us.auth0.com/api/v2/`,
            algorithms: ['RS256'],
        };
        return jwt.verify(token, publicKey, verifyOptions);
    } catch (e) {
        return null;
    }
}
