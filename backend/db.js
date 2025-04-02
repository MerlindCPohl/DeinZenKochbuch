const pg = require('pg');
require('dotenv').config();

const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});


client.connect(err => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connection to DB ...');
    }
});

module.exports = client;