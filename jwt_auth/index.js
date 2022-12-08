const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const {sign} = require("jsonwebtoken");
const fs = require("fs");
const {logger} = require("./logger.js");

const PORT = 3000;
const AUTHORIZATION = 'Authorization';
const EXPIRES_IN = '2m';
const SECRET_KET_FILE_PATH = './key.txt';

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'Yaroslav',
        password: '1234',
        username: 'AXW123231',
    }
];

const loginHistory = {};

const secretKey = getSecretKey();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use((req, res, next) => {
    let token = req.get(AUTHORIZATION);
    const payload = validateAndGetPayload(token);
    if (payload) {
        req.userInfo = payload;
    }
    next();
});

app.get('/', (req, res) => {
    const {userInfo} = req;
    if (userInfo) {
        const username = getUsername(userInfo.login);
        return res.json({
            username: username
        });
    }
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.post('/api/login', (req, res) => {
    const {login, password} = req.body;

    const user = users.find((user) => {
        return user.login === login && user.password === password;
    });

    const ip = req.socket.remoteAddress;
    if (user && !checkIfBlocked(ip)) {
        const token = createSignedToken(user);
        logger.info(`Successfully logged in, IP: ${ip}, user: ${user.login}`);
        res.json({token});
    } else {
        saveUnsuccessfulAttempt(ip);
        logger.info(`Unsuccessful attempt to login as from IP: ${ip}`);
    }

    res.status(401).send();
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
        if ((curr.getTime() - prev.getTime()) / 1000 / 60 < 5000 && loginHistory[ip].status === 'Allowed') {
            loginHistory[ip].status = 'Blocked';
            loginHistory[ip].blockingEndTime = new Date(new Date().getTime()+2*60*1000);
            logger.info(`2 unsuccessful log in attempts in 5 minutes for IP: ${ip}. Block time 2 min.\n
             Further login attempts before the lockout time expires will be ignored`);
        }
    }
}

function getSecretKey() {
    return fs.readFileSync(SECRET_KET_FILE_PATH);
}

function validateAndGetPayload(token) {
    try {
        return jwt.verify(token, secretKey);
    } catch (e) {
        return null;
    }
}

function createSignedToken(user) {
    const payload = {login: user.login};
    return sign(payload, secretKey, {expiresIn: EXPIRES_IN});
}

function getUsername(login) {
    const user = users.find((user) => {
        return user.login === login;
    });
    if (user) {
        return user.username;
    }
    return null;
}
