
import { AxiosError, AxiosResponse } from "axios";
import { Request, Response } from "express";

const router = require('express').Router();

const xss = require('xss'); //used for cleaning user input


/**
 * How to use API
 */
// const axios = require('axios').default;

//     axios.get('https://sandbox.tradier.com/v1/markets/search', {
//     params: {
//         'q': 'jo',
//         'indexes': 'false'
//     },    
//     headers: {
//         'Authorization': 'Bearer <token>',
//         'Accept': 'application/json'
//     }
//     }).then((response: AxiosResponse) => {
//         console.log(response.data);
//         res.json(response.data );
//     }).catch((err : AxiosError) => {
//         res.json(err);
//     })


/**
 * User calls this with their login token to make a purchase.
 * 
 * I assume this is extremely insecure but I'm not sure how real payment systems handle this. Do you ask them for their password each time?
 * 
 * TODO: get password of individual and hash it with salt
 * TODO: get cost of stock from API to make sure they paying right amt
 */
router.route('/purchaseStock').post(async (req: Request, res: Response) => {

    // const cleanToken: string = xss(req.body.token);
    // const cleanPassword: string = xss(req.body.password);

    // let response = await LoginAndRegisteration.registerUser(cleanUsername, cleanPassword, cleanEmail);

    // if (response.http_id == 400 || response.http_id == 999)
    //     res.status(response.http_id).json(response.message);
    // else {
    //     res.json(response.message);
    // }

    

})


module.exports = router