'use strict';

const {logger} = require("../logger");
const {config} = require("../config");

const loginHistory = {};

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
        if ((curr.getTime() - prev.getTime()) / 1000 / 60 < config.timeRangeToCheck && loginHistory[ip].status === 'Allowed') {
            loginHistory[ip].status = 'Blocked';
            loginHistory[ip].blockingEndTime = new Date(new Date().getTime() + config.blockingTime);
            logger.info(`2 unsuccessful log in attempts in 5 minutes for IP: ${ip}. Block time 2 min.\n
             Further login attempts before the lockout time expires will be ignored`);
        }
    }
}

module.exports = {
    checkIfBlocked,
    saveUnsuccessfulAttempt,
    loginHistory
};