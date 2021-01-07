
import axios, { AxiosError, AxiosResponse } from "axios";
import { Request, Response } from "express";
import { createImportSpecifier } from "typescript";

const router = require('express').Router();

const xss = require('xss'); //used for cleaning user input
const Transactions = require('../src/Transactions');
const api = require('../../config/apiTokens');



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
    const cleanStockName: string = xss(req.body.stockName);
    const cleanStockPrice: number = +xss(req.body.stockPrice); //+'string' casts to number
    const cleanAmtOfStocks: number = +xss(req.body.amtOfStocks);
    const cleanExchange: string = xss(req.body.exchange);

    /**
     * Make sure input is not null or empty
     */
    if (
        cleanStockPrice != 0 && cleanStockName.length != 0
        && cleanAmtOfStocks != 0 && cleanExchange.length != 0
        && cleanToken.length != 0 && cleanPassword.length != 0
        && cleanAmtOfStocks > 0
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

/**
 * User calls this with their login token to make a purchase of an option.
 * 
 * 
 */
router.route('/purchaseOption').post((req: Request, res: Response) => {

    //used for authentication
    const cleanToken: string = xss(req.body.token);
    const cleanPassword: string = xss(req.body.password);

    //used for purchase
    const cleanOptionSymbol: string = xss(req.body.optionSymbol);
    const cleanOptionPrice: number = +xss(req.body.optionPrice); //+'string' casts to number
    const cleanAmtOfContracts: number = +xss(req.body.amtOfContracts);

    /**
     * Make sure input is not null or empty
     */

    if (
        cleanOptionPrice != 0 && cleanOptionSymbol.length != 0
        && cleanAmtOfContracts != 0
        && cleanToken.length != 0 && cleanPassword.length != 0
        && cleanAmtOfContracts > 0
    ) {

        axios.get("https://sandbox.tradier.com/v1/markets/quotes", {
            params: {
                'symbols': cleanOptionSymbol

            },
            headers: {
                'Authorization': 'Bearer ' + api.getToken(),
                'Accept': 'application/json'
            }
        }).then(async (response: AxiosResponse) => {

            let optionPrice = (+response.data.quotes.quote.last) * 100;

            let purchaseResponse = await Transactions.purchaseOption(
                cleanToken,
                cleanPassword,

                cleanOptionSymbol,
                optionPrice,
                cleanAmtOfContracts
            );

            if (purchaseResponse.http_id == 400 || purchaseResponse.http_id == 999)
                res.status(purchaseResponse.http_id).json(purchaseResponse.message);
            else {
                res.json(purchaseResponse.message);
            }
        }).catch((err: AxiosError) => {

            res.status(400).json("Error confirming option price");

        })



    } else {
        res.status(400).json("Inputs are invalid");
    }
})

/**
 * Gets a user's purchases of a specific stock
 */
router.route('/getSpecificPosition').get(async (req: Request, res: Response) => {
    const cleanUserId = +xss(req.query.userId);
    const cleanStockSymbol = xss(req.query.stockSymbol);

    if (cleanUserId != 0 && cleanUserId != null && cleanStockSymbol.length > 0) {
        let response = await Transactions.getUserPositionsSpecificStock(cleanUserId, cleanStockSymbol);

        if (response.http_id == 400 || response.http_id == 999)
            res.status(response.http_id).json(response.message);
        else {
            res.json(response);
        }
    } else {

        res.status(400).json("Inputs are invalid");
    }
})


/**
 * Gets a user's purchases of a stock's options
 */
router.route('/getSpecificOptionPosition').get(async (req: Request, res: Response) => {
    const cleanUserId = +xss(req.query.userId);
    const cleanStockSymbol = xss(req.query.stockSymbol);

    if (cleanUserId != 0 && cleanUserId != null && cleanStockSymbol.length > 0) {
        let response = await Transactions.getUserPositionsSpecificOption(cleanUserId, cleanStockSymbol);

        if (response.http_id == 400 || response.http_id == 999)
            res.status(response.http_id).json(response.message);
        else {
            res.json(response);
        }
    } else {

        res.status(400).json("Inputs are invalid");
    }
})

module.exports = router