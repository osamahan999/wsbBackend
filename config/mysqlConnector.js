const mysql = require('mysql');


const host = "jhdjjtqo9w5bzq2t.cbetxkdyhwsb.us-east-1.rds.amazonaws.com";
const username = "aob5cg7xt4nklugi";
const password = "ej1x1kzzieq8yomi";
const database = "ox5m83t2au5s2rcy";


//for my ease
const loginString = "mysql -h jhdjjtqo9w5bzq2t.cbetxkdyhwsb.us-east-1.rds.amazonaws.com -u aob5cg7xt4nklugi -pej1x1kzzieq8yomi ox5m83t2au5s2rcy";



var connectionPool = mysql.createPool({
    connectionLimit: 8, //max connections is 10, so playing it safe with 8
    host: host,
    user: username,
    password: password,
    database: database,
    debug: false
});

module.exports = connectionPool;