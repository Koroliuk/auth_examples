'use strict'

const request = require("request");

const domain = 'dev-ciqz1vdq1irife3n.us.auth0.com';
const clientId = 'mdfALuYL914gp5lqPsoOWaIgh8gtMyXq';
const clientSecret = 'wRBB9kua92GDaDTNXsLPhUMSaKKwcu7UCYCtVvEIsVopLLBLGJzosBeWgAU-JEDx';
const audience = 'https://dev-ciqz1vdq1irife3n.us.auth0.com/api/v2/';

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
