
import * as crypto from 'crypto'; //used for generating salt
import { MysqlError, Pool, PoolConnection } from 'mysql';

const pool: Pool = require('../../config/mysqlConnector.js'); //connection pool

/**
 * SHA256 hash using salt
 * @param {16 byte random string} salt 
 * @param {user input password} pwd 
 */
const hash = (pwd: string, salt: string) => {
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
const registerUser = (username: string, password: string, email: string) => {

    const salt: string = crypto.randomBytes(16).toString('hex');
    const hashedPassword: string = hash(password, salt);
    /**
     * Procedure creates a new user with base amt of money of 15k. 
     */
    const query: string = "CALL register_user( ?, ?, ?, ?)";


    return (new Promise((resolve, reject) => {
        pool.getConnection((error: MysqlError, connection: PoolConnection) => {

            if (error) reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, [username, hashedPassword, salt, email], (err, results, fields) => {


                    if (err) reject({ http_id: 400, message: "Failed to register" }); //400 is my failed due to bad data
                    else resolve({ http_id: 200, message: "successful register" });

                })
            }
            connection.release();
        })
    })).then((json) => {
        return json;
    }).catch((err) => {
        return err;
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
const loginUserToken = (token: string) => {
    const query = "CALL get_user_by_token(?)";

    return new Promise((resolve, reject) => {
        pool.getConnection((error: MysqlError, connection: PoolConnection) => {
            if (error) reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, token, (err, results, fields) => {
                    if (err) reject({ http_id: 400, message: "Not logged in or bad token" });
                    else if (results[0].length != 1) reject({ http_id: 400, message: "Not logged in or bad token" });
                    else resolve({ http_id: 200, message: "User found", user: results[0] });
                })
            }

            connection.release();
        })
    }).then((result) => { return result })
        .catch((err) => { return err });

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
const loginUserNoToken = (username: string, password: string) => {

    const query: string = "SELECT hashed_password, salt, user_id FROM user WHERE username = ?";

    return (new Promise((resolve, reject) => {
        pool.getConnection((error: MysqlError, connection: PoolConnection) => {
            if (error) reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, username, (err, results, fields) => {
                    if (err || results.length == 0) reject({ http_id: 400, message: "Wrong username or password" });
                    else {

                        let salt: string = results[0].salt;
                        let hashedPassword: string = results[0].hashed_password;
                        let userId: number = results[0].user_id;

                        if (hashedPassword == hash(password, salt)) {
                            let token: string = crypto.randomBytes(64).toString('hex'); //I conjure a 64 byte token from random bytes


                            let query: string = "CALL new_login_token(?, ?)";

                            connection.query(query, [userId, token], (err, results, fields) => {
                                if (err) reject({ http_id: 400, message: "token add failed" });
                                else resolve({ http_id: 200, message: "Successful sign in", token: token, user: results[0] });

                            });
                        }
                        else
                            reject({ http_id: 400, message: "Wrong username or password" });
                    }
                })
            }

            connection.release();
        })
    }).then((result) => { return result })
        .catch((err) => { return err })
    )




}


/**
 * Deletes a login token
 * @param token Login token
 */
const logoutUser = (token: string) => {

    const query: string = "DELETE FROM user_token WHERE token = ?";

    return new Promise((resolve, reject) => {

        pool.getConnection((error : MysqlError, connection : PoolConnection) => {
            if (error) reject({http_id: 999, message: "Failed to get connection from pool"});
            else {
                connection.query(query, token, (err, results, fields) => {
                    if (err) reject({http_id: 400, message: "Failed to delete token"});
                    else resolve({http_id:200, message: "Token deleted successfully"});
                })
            }

            connection.release();

        })
    });



    return null;
}


module.exports = {
    registerUser,
    loginUserNoToken,
    loginUserToken,
    logoutUser,
    hash
}
