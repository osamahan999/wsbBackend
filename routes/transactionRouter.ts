
import { AxiosError, AxiosResponse } from "axios";
import { Request, Response } from "express";

const router = require('express').Router();

const xss = require('xss'); //used for cleaning user input
const Transactions = require('../src/Transactions');

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
 * TODO: get cost of stock from API to make sure they paying right amt. Can do this, but this doubles my api calls so not doing it
 */
router.route('/purchaseStock').post(async (req: Request, res: Response) => {

    //used for authentication
    const cleanToken: string = xss(req.body.token);
    const cleanPassword: string = xss(req.body.password);

    //used for purchase
    const cleanStockSymbol: string = xss(req.body.stockSymbol);
    const cleanStockName : string = xss(req.body.stockName);
    const cleanStockPrice : number = +xss(req.body.stockPrice); //+'string' casts to number
    const cleanAmtOfStocks : number = +xss(req.body.amtOfStocks);
    const cleanExchange : string = xss(req.body.exchange); 
    
    /**
     * Make sure input is not null
     */

    if (
        cleanStockPrice != 0 && cleanStockName.length != 0 
        &&  cleanAmtOfStocks != 0 && cleanExchange.length != 0 
        && cleanToken.length != 0 && cleanPassword.length != 0
        ) {

        let response = await Transactions.purchaseStock(
            cleanToken,
            cleanPassword,
            cleanStockSymbol,
            cleanStockName,
            cleanStockPrice,
            cleanAmtOfStocks,
            cleanExchange
        );
    
        if (response.http_id == 400 || response.http_id == 999)
            res.status(response.http_id).json(response.message);
        else {
            res.json(response.message);
        }
    } else {
        res.status(400).json("Inputs are invalid");
    }
    




    

})


module.exports = router