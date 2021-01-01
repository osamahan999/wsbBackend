"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var crypto = __importStar(require("crypto")); //used for generating salt
var pool = require('../../config/mysqlConnector.js'); //connection pool
/**
 * SHA256 hash using salt
 * @param {16 byte random string} salt
 * @param {user input password} pwd
 */
var hash = function (pwd, salt) {
    var hashAlgo = crypto.createHash('sha256');
    pwd = hashAlgo.update(salt + pwd).digest('hex');
    hashAlgo.end();
    return pwd;
};
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
var registerUser = function (username, password, email) {
    var salt = crypto.randomBytes(16).toString('hex');
    var hashedPassword = hash(password, salt);
    /**
     * Procedure creates a new user with base amt of money of 15k.
     */
    var query = "CALL register_user( ?, ?, ?, ?)";
    return (new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, [username, hashedPassword, salt, email], function (err, results, fields) {
                    if (err)
                        reject({ http_id: 400, message: "Failed to register" }); //400 is my failed due to bad data
                    else
                        resolve({ http_id: 200, message: "successful register" });
                });
            }
            connection.release();
        });
    })).then(function (json) {
        return json;
    }).catch(function (err) {
        return err;
    });
};
/**
 * Takes in a log in token, authenticates if this is a documented token, and returns user info if so.
 *
 * output:
 * http_id: 400 means wrong token info or it does not exist anymore. TODO: make this href to log in page
 * http_id: 200 means logged in, sends back the result json
 * @param {128 byte String in hex} token
 */
var loginUserToken = function (token) {
    var query = "CALL get_user_by_token(?)";
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, token, function (err, results, fields) {
                    if (err)
                        reject({ http_id: 400, message: "Not logged in or bad token" });
                    else if (results[0].length != 1)
                        reject({ http_id: 400, message: "Not logged in or bad token" });
                    else
                        resolve({ http_id: 200, message: "User found", user: results[0] });
                });
            }
            connection.release();
        });
    }).then(function (result) { return result; })
        .catch(function (err) { return err; });
};
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
var loginUserNoToken = function (username, password) {
    var query = "SELECT hashed_password, salt, user_id FROM user WHERE username = ?";
    return (new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, username, function (err, results, fields) {
                    if (err || results.length == 0)
                        reject({ http_id: 400, message: "Wrong username or password" });
                    else {
                        var salt = results[0].salt;
                        var hashedPassword = results[0].hashed_password;
                        var userId = results[0].user_id;
                        if (hashedPassword == hash(password, salt)) {
                            var token_1 = crypto.randomBytes(64).toString('hex'); //I conjure a 64 byte token from random bytes
                            var query_1 = "CALL new_login_token(?, ?)";
                            connection.query(query_1, [userId, token_1], function (err, results, fields) {
                                if (err)
                                    reject({ http_id: 400, message: "token add failed" });
                                else
                                    resolve({ http_id: 200, message: "Successful sign in", token: token_1, user: results[0] });
                            });
                        }
                        else
                            reject({ http_id: 400, message: "Wrong username or password" });
                    }
                });
            }
            connection.release();
        });
    }).then(function (result) { return result; })
        .catch(function (err) { return err; }));
};
/**
 * Deletes a login token
 * @param token Login token
 */
var logoutUser = function (token) {
    var query = "DELETE FROM user_token WHERE token = ?";
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, token, function (err, results, fields) {
                    if (err)
                        reject({ http_id: 400, message: "Failed to delete token" });
                    else
                        resolve({ http_id: 200, message: "Token deleted successfully" });
                });
            }
            connection.release();
        });
    });
    return null;
};
module.exports = {
    registerUser: registerUser,
    loginUserNoToken: loginUserNoToken,
    loginUserToken: loginUserToken,
    logoutUser: logoutUser
};
