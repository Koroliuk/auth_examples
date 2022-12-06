const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const {sign} = require("jsonwebtoken");
const fs = require("fs");

const PORT = 3000;
const AUTHORIZATION = 'Authorization';
const EXPiRES_IN = '2m';
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

    if (user) {
        const token = createSignedToken(user);
        res.json({token});
    }

    res.status(401).send();
});


app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});

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
    return sign(payload, secretKey, {expiresIn: EXPiRES_IN});
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
