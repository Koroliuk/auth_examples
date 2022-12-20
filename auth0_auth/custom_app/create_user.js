'use strict'

const request = require("request");

const domain = 'dev-ciqz1vdq1irife3n.us.auth0.com';
const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFhSDQtQy1OdGRiTVpiOWtIOFRrWCJ9.eyJpc3MiOiJodHRwczovL2Rldi1jaXF6MXZkcTFpcmlmZTNuLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJtZGZBTHVZTDkxNGdwNWxxUHNvT1dhSWdoOGd0TXlYcUBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9kZXYtY2lxejF2ZHExaXJpZmUzbi51cy5hdXRoMC5jb20vYXBpL3YyLyIsImlhdCI6MTY3MTUwNjc2MywiZXhwIjoxNjcxNTkzMTYzLCJhenAiOiJtZGZBTHVZTDkxNGdwNWxxUHNvT1dhSWdoOGd0TXlYcSIsInNjb3BlIjoicmVhZDp1c2VycyBjcmVhdGU6dXNlcnMiLCJndHkiOiJjbGllbnQtY3JlZGVudGlhbHMifQ.RwvcpMcGhyWiiuS24rhopgLItbIh_o8cBQb3aM5axMdo6C1CVykNXFE9gZccCy3wbvB1xzE4RMNMU1JRKcbp9Ey-LlYhHx7D18ZpbH6cPWIgK6t3yWU8MGG-_PpzW-HaPrNA0X9D5Mq6WgQD542pJEn8sfiIh4A5H_spA7OPe0hhSKJjMBGpkYIPZ4ziVXXl3ZD2tLRXzriFzAlBN4sDvB2XkeVh_HrPhCTI8lOw1rbuuFHH-L1cvalr0_uk6ic2gHTLKErPFxbKNmwz2w7Ibk-9zHh3q3UfLdqMLgZaMw2HbCF_vooEHEeA4l3MigO1s5WqD3id_m0kOsTiUcQMmA';

const options = { method: 'POST',
    url: `https://${domain}/api/v2/users`,
    headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body:
        {
            email: 'test.123.abc@xyz.com',
            name: 'Test 123-ABC',
            connection: 'Username-Password-Authentication',
            password: 'qwerty123!!'
        },
    json: true
};

request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body)
});
