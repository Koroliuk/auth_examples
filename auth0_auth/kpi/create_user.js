'use strict'

const request = require("request");

const domain = 'kpi.eu.auth0.com';
const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjVCZTlBZFhrMERaUjhmR1dZYjdkViJ9.eyJpc3MiOiJodHRwczovL2twaS5ldS5hdXRoMC5jb20vIiwic3ViIjoiSkl2Q081YzJJQkhsQWUycGF0bjZsNnE1SDM1cXh0aTBAY2xpZW50cyIsImF1ZCI6Imh0dHBzOi8va3BpLmV1LmF1dGgwLmNvbS9hcGkvdjIvIiwiaWF0IjoxNjcxNTAzMDI1LCJleHAiOjE2NzE1ODk0MjUsImF6cCI6IkpJdkNPNWMySUJIbEFlMnBhdG42bDZxNUgzNXF4dGkwIiwic2NvcGUiOiJyZWFkOnVzZXJzIGNyZWF0ZTp1c2VycyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.paHsUPyMFA7il_9NcVix03D2-GolE-zuPhHUsZv6oe1A6_fj0A22GLUsPqOr-EWPXPuhTO9dQJVXdNRyHid87J1vAczxBq3Pbk121kdkk-QMQpOAWrzAjGNsPazN0em1Uagd6Ifl1CAOXNApS_BpQU3CZfKn2g3y-4xSIPHXflP2abnEqXG2eqUJkc6C15mozGBYiS2qrDQegAjtk-ifIhRKm2FoCzM92zppuNbF-02gcgi0XQ-nRAmhAjre4TtUGuNSoefDvrnXYkkl9oJrW5zQUlO48hg0qjghs6pnsCtHQp0SPEY62lPjrqXR8jzcfEHuOpB1u6fFN83yPwdrDg';

const options = { method: 'POST',
    url: `https://${domain}/api/v2/users`,
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
