
import { AxiosError, AxiosResponse } from "axios";
import { Request, Response } from "express";

const router = require('express').Router();

const xss = require('xss'); //used for cleaning user input

const api = require('../../config/apiTokens');


const axios = require('axios').default;


/**
 * https://stackoverflow.com/questions/35612428/call-async-await-functions-in-parallel
 * 
 * for parallel http requests
 */


/**
 * 
 * Searches for stocks that match the input from the user
 * 
 * @param {string} input
 * @return {Array<JSON>} stocks 
 */
router.route('/searchBySymbol').get((req: Request, res: Response) => {

    let searchInput: string = xss(req.query.input);

    axios.get("https://sandbox.tradier.com/v1/markets/search", {
        params: {
            'q': searchInput,
            'indexes': false
        },
        headers: {
            'Authorization': 'Bearer ' + api.getToken(),
            'Accept': 'application/json'
        }
    }).then((response: AxiosResponse) => {
        let stocks: Array<JSON> = (response.data.securities.security);
        let i = stocks.length;

        i > 4 ? res.json(stocks.slice(0, 4)) : res.json(stocks);


    }).catch((err: AxiosError) => {

        res.status(400).json("empty");

    })

})


/**
 * Gets a stock's quote by taking in the symbol for said stock
 * @param {string} stock
 * @return {JSON} quote
 */
router.route('/getStockQuote').get((req: Request, res: Response) => {

    let stock: string = xss(req.query.symbol);



    axios.get("https://sandbox.tradier.com/v1/markets/quotes", {
        params: {
            'symbols': stock,
            'greeks': true
        },
        headers: {
            'Authorization': 'Bearer ' + api.getToken(),
            'Accept': 'application/json'
        }
    }).then((response: AxiosResponse) => {
        let quote: JSON = response.data.quotes.quote;
        console.log(response.data);
        res.json(quote);


    }).catch((err: AxiosError) => {

        res.status(400).json(err);

    })

})


/**
 * TODO: options router
 * 
 * 1. get option expirations
 * 2. get options for symbol with said expirations
 * 3. return #2
 * 
 * Takes in a stock symbol 
 * 
 * Returns an array of JSON of options for said stock
 * 
 * 
 */

router.route('/getOptions').get((req: Request, res: Response) => {

    let stock: string = xss(req.query.symbol);



    axios.get("https://sandbox.tradier.com/v1/markets/options/lookup", {
        params: {
            'underlying': stock
        },
        headers: {
            'Authorization': 'Bearer ' + api.getToken(),
            'Accept': 'application/json'
        }
    }).then((response: AxiosResponse) => {
        let options: Array<JSON> = response.data.symbols[0].options;
        let len = options.length;

        len > 2100 ? res.json(options.slice(0, 2100)) : res.json(options);




    }).catch((err: AxiosError) => {

        res.status(400).json(err);

    })

})





module.exports = router