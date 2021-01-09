
const mysql = require('mysql');

var connectionPool = mysql.createPool({
    connectionLimit: 8,
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    debug: false
});


module.exports = connectionPool;