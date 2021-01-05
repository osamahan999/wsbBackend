
import { Request, Response } from "express";

const router = require('express').Router();

const xss = require('xss'); //used for cleaning user input


/**
 * Registration and login routes
 */
const LoginAndRegisteration = require("../src/LoginAndRegistration");

/**
 * Registers a user if username and email are unique
 * 
 * @param {String} username
 * @param {String} password
 * @param {String} email
 */
router.route('/userRegister').post(async (req: Request, res: Response) => {

    const cleanUsername: string = xss(req.body.username);
    const cleanPassword: string = xss(req.body.password);
    const cleanEmail: string = xss(req.body.email);

    let response = await LoginAndRegisteration.registerUser(cleanUsername, cleanPassword, cleanEmail);

    if (response.http_id == 400 || response.http_id == 999)
        res.status(response.http_id).json(response.message);
    else {
        res.json(response.message);
    }

})


/**
 * Logs a user in by the token. Uses a 256 bit token, so absolutely impossible to brute force this.
 * 
 * @param {String} token
 */
router.route('/loginWithToken').post(async (req: Request, res: Response) => {
    const cleanToken = xss(req.body.token);

    let response = await LoginAndRegisteration.loginUserToken(cleanToken);

    if (response.http_id == 400 || response.http_id == 999)
        res.status(response.http_id).json(response.message);
    else {
        let user = response.user;
        res.json(user);
    }
})

/**
 * Logs a user and produces a token.
 * 
 * Returns a login token
 * 
 * @param {String} username
 * @param {String} password
 */
router.route('/loginWithoutToken').post(async (req: Request, res: Response) => {
    const cleanUsername: string = xss(req.body.username);
    const cleanPassword: string = xss(req.body.password);

    let response = await LoginAndRegisteration.loginUserNoToken(cleanUsername, cleanPassword);

    if (response.http_id == 400 || response.http_id == 999)
        res.status(response.http_id).json(response.message);
    else {
        let user = response.user[0];

        user["token"] = response.token;
        res.json(user);
    }

})

/**
 * Logout delete token
 */
router.route('/logout').post(async (req: Request, res: Response) => {
    const cleanToken: string = xss(req.body.token);

    let response = await LoginAndRegisteration.logoutUser(cleanToken);

    if (response.http_id == 400 || response.http_id == 999)
        res.status(response.http_id).json(response.message);
    else {
        res.json(response.message);
    }
})


module.exports = router