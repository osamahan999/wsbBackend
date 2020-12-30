
const crypto = require('crypto'); //used for generating salt

const pool = require('../config/mysqlConnector'); //connection pool

/**
 * SHA256 hash using salt
 * @param {16 byte random string} salt 
 * @param {user input password} pwd 
 */
const hash = (pwd, salt) => {
    const hashAlgo = crypto.createHash('sha256');

    pwd = hashAlgo.update(salt + pwd).digest('hex');
    hashAlgo.end();

    return pwd;
}

/**
 * Registers a new user
 * 
 * Output http_id:
 * 999: Failed connection
 * 400: Failed register
 * 200: Successful register
 * 
 * 
 * 
 * @param {String} username 
 * @param {String} password 
 * @param {String} email 
 */
const registerUser = (username, password, email) => {

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = hash(password, salt);

    /**
     * Procedure creates a new user with base amt of money of 15k. 
     */
    const query = "CALL register_user( ?, ?, ?, ?)";

    pool.getConnection((error, connection) => {
        if (error) return { http_id: 999, message: "Failed to get connection from pool" };
        else {
            connection.query(query, [username, hashedPassword, salt, email], (err, results, fields) => {
                if (err) return { http_id: 400, message: "Failed to register" }; //400 is my failed due to bad data
                else return { http_id: 200, message: "successful register" };
            })
        }

        connection.release();
    })
}

/**
 * Takes in a log in token, authenticates if this is a documented token, and returns user info if so.
 * 
 * output: 
 * http_id: 400 means wrong token info or it does not exist anymore. TODO: make this href to log in page
 * http_id: 200 means logged in, sends back the result json 
 * @param {128 byte String in hex} token 
 */
const loginUserToken = (token) => {
    const query = "CALL get_user_by_token(?)";

    pool.getConnection((error, connection) => {
        if (error) return { http_id: 999, message: "Failed to get connection from pool" };
        else {
            connection.query(query, token, (err, results, fields) => {
                if (err || results.length == 0) return { http_id: 400, message: "Not logged in or bad token" };
                else return { http_id: 200, message: "User found", user: results[0] };
            })
        }

        connection.release();
    })
}


/**
 * Takes in XSS cleaned data from the routers, and returns a json object
 * 
 * Logs you in if you do not have a token. Generates a new token and stores it. Sends it back to web browser
 * 
 * Output:
 * If success -> {http_id: 200, message: "Successful sign in", token}
 * If error -> {http_id: 999 or 400, message: error msg}
 * 
 * 
 * @param {*String} username 
 * @param {*String} password 
 */
const loginUserNoToken = (username, password) => {

    const query = "SELECT hashed_password, salt, user_id FROM user WHERE username = ?";

    pool.getConnection((error, connection) => {
        if (error) return { http_id: 999, message: "Failed to get connection from pool" };
        else {
            connection.query(query, username, (err, results, fields) => {
                if (err || results.length == 0) return { http_id: 400, message: "Wrong username or password" };
                else {

                    let salt = results[0].salt;
                    let hashedPassword = results[0].hashed_password;
                    let userId = results[0].user_id;

                    if (hashedPassword == hash(password, salt)) {
                        let token = crypto.randomBytes(64).toString('hex'); //I conjure a 64 byte token from random bytes


                        let query = "CALL new_login_token(?, ?)";

                        connection.query(query, [userId, token], (err, results, fields) => {
                            if (err) return { http_id: 400, message: "token add failed" }
                        })


                        return { http_id: 200, message: "Successful sign in", token: token };

                    }
                    else
                        return { http_id: 400, message: "Wrong username or password" };
                }
            })
        }

        connection.release();
    })


    return null;
}

const logoutUser = () => {


    return null;
}


module.exports = {
    registerUser,
    loginUserNoToken,
    loginUserToken,
    logoutUser
}
