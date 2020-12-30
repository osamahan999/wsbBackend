const router = require('express').Router();

const xss = require('xss'); //used for cleaning user input
const pool = require('../config/mysqlConnector'); //connection pool


const LoginAndRegisteration = require("../src/LoginAndRegisteration");

/**
 * Registers a user if username and email are unique
 * 
 * @param {String} username
 * @param {String} password
 * @param {String} email
 */
router.route('/userRegister').post(async (req, res) => {

    const cleanUsername = xss(req.body.username);
    const cleanPassword = xss(req.body.password);
    const cleanEmail = xss(req.body.email);

    let response = await LoginAndRegisteration.registerUser(cleanUsername, cleanPassword, cleanEmail);

    if (response.http_id == 400 || response.http_id == 999)
        res.status(response.http_id).json(response.message);
    else {
        res.json(response.message);
    }

})


/**
 * Logs a user in by the token. Uses a 256 bit token, so absolutely impossible to brute force this.
 */
router.route('/loginWithToken').post(async (req, res) => {
    const cleanToken = xss(req.body.token);

    let response = await LoginAndRegisteration.loginUserToken(cleanToken);

    if (response.http_id == 400 || response.http_id == 999)
        res.status(response.http_id).json(response.message);
    else {
        let user = response.user;
        res.json("Success");
    }
})

/**
 * Logs a user in by the token. Uses a 256 bit token, so absolutely impossible to brute force this.
 */
router.route('/loginWithoutToken').post(async (req, res) => {
    const cleanUsername = xss(req.body.username);
    const cleanPassword = xss(req.body.password);

    let response = await LoginAndRegisteration.loginUserNoToken(cleanUsername, cleanPassword);

    res.json(response);

    // if (response.http_id == 400 || response.http_id == 999)
    //     res.status(response.http_id).json(response.message);
    // else {
    //     let user = response.user;
    //     res.json("Success");
    // }

})


module.exports = router