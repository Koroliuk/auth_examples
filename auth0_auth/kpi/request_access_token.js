'use strict'

const request = require("request");

const domain = 'kpi.eu.auth0.com';
const clientId = 'JIvCO5c2IBHlAe2patn6l6q5H35qxti0';
const clientSecret = 'ZRF8Op0tWM36p1_hxXTU-B0K_Gq_-eAVtlrQpY24CasYiDmcXBhNS6IJMNcz1EgB';
const audience = 'https://kpi.eu.auth0.com/api/v2/';

const options = { method: 'POST',
    url: `https://${domain}/oauth/token`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    form:
        {
            client_id: `${clientId}`,
            client_secret: `${clientSecret}`,
            audience: `${audience}`,
            grant_type: 'client_credentials'
        }
};

request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body)
});
