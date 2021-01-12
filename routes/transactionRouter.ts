
import axios, { AxiosError, AxiosResponse } from "axios";
import { Request, response, Response } from "express";

const router = require('express').Router();
const xss = require('xss'); //used for cleaning user input


const Transactions = require('../src/Transactions');
const StockData = require('../src/StockData');


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
    const cleanAmtOfStocks: number = +xss(req.body.amtOfStocks);
    const cleanExchange: string = xss(req.body.exchange);

    const costOfStock: number = +(await StockData.getQuoteBySymbol(cleanStockSymbol)).quotes.ask; //get current stock price

    /**
     * Make sure input is not null or empty
     */
    if (
        costOfStock != 0 && cleanStockName.length != 0
        && cleanAmtOfStocks != 0 && cleanExchange.length != 0
        && cleanToken.length != 0 && cleanPassword.length != 0
        && cleanAmtOfStocks > 0
    ) {

        let response = await Transactions.purchaseStock(
            cleanToken,
            cleanPassword,
            cleanStockSymbol,
            cleanStockName,
            costOfStock,
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
 * Sell a stock
 */
router.route('/sellStock').post(async (req: Request, res: Response) => {
    const cleanUserId: number = +xss(req.body.userId);
    const cleanPurchaseId: number = +xss(req.body.purchaseId);
    const cleanAmtToSell: number = +xss(req.body.amtToSell);
    const cleanStockSymbol: string = xss(req.body.stockSymbol);

    //pull current cost of stock
    const costOfStock: number = +(await StockData.getQuoteBySymbol(cleanStockSymbol)).quotes.ask;

    /**
      * Make sure input is not null or empty
      */
    if (
        cleanUserId >= 0 &&
        (cleanStockSymbol != undefined && cleanStockSymbol.length != 0)
        && cleanAmtToSell != 0 && cleanPurchaseId >= 0 &&
        (costOfStock != undefined && costOfStock >= 0)
    ) {
        const response = await Transactions.sellStock(cleanUserId, cleanPurchaseId, cleanAmtToSell, costOfStock);
        res.status(response.http_id).json(response.message);

    } else {
        res.status(400).json("Bad input");

    }
})




/**
 * Sell contracts
 */
router.route('/sellContract').post(async (req: Request, res: Response) => {
    const cleanUserId: number = +xss(req.body.userId);
    const cleanOptionPurchaseId: number = +xss(req.body.optionPurchaseId);
    const cleanAmtToSell: number = +xss(req.body.amtToSell);
    const cleanOptionSymbol: string = xss(req.body.optionSymbol);

    //pull current cost of stock

    const costOfContract: number = +(await (StockData.getQuoteBySymbol(cleanOptionSymbol))).quotes.ask;

    if (isNaN(costOfContract)) res.status(400).json("Expired");
    else {
        /**
           * Make sure input is not null or empty
           */
        if (
            cleanUserId >= 0 &&
            (cleanOptionSymbol != undefined && cleanOptionSymbol.length != 0)
            && cleanAmtToSell != 0 && cleanOptionPurchaseId >= 0 &&
            (costOfContract != undefined && costOfContract >= 0)
        ) {
            const response = await Transactions.sellContract(cleanUserId, cleanOptionPurchaseId, cleanAmtToSell, costOfContract);
            res.status(response.http_id).json(response.message);

        } else {
            res.status(400).json("Bad input");

        }
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
 * TODO: refactor to getAllPositionsOrOne
 */
router.route('/getSpecificPosition').get(async (req: Request, res: Response) => {
    const cleanUserId = +xss(req.query.userId);
    let cleanStockSymbol: string | null;
    //if it is not null, clean it, else set the input var as null
    req.query.stockSymbol != null ? cleanStockSymbol = xss(req.query.stockSymbol) : cleanStockSymbol = null;


    if (cleanUserId != 0 && cleanUserId != null) {
        let response = await Transactions.getUserPositionsSpecificStockOrAll(cleanUserId, cleanStockSymbol);

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
  * TODO: refactor to getAllContractsOrOne

 */
router.route('/getSpecificOptionPosition').get(async (req: Request, res: Response) => {
    const cleanUserId = +xss(req.query.userId);
    let cleanStockSymbol: string | null;

    req.query.stockSymbol != null ? cleanStockSymbol = xss(req.query.stockSymbol) : cleanStockSymbol = null;

    if (cleanUserId != 0 && cleanUserId != null) {
        let response = await Transactions.getUserPositionsSpecificOptionOrAll(cleanUserId, cleanStockSymbol);

        if (response.http_id == 400 || response.http_id == 999)
            res.status(response.http_id).json(response.message);
        else {
            res.json(response);
        }
    } else {

        res.status(400).json("Inputs are invalid");
    }
})

router.route('/getUserStockHistory').get(async (req: Request, res: Response) => {
    const cleanUserId: number = (req.query.userId != undefined ? +req.query.userId : -1);
    const cleanSalesOrPurchases: string = xss(req.query.salesOrPurchases);

    //String if sent in, null if not sent in,
    let cleanFilterSymbol: string | null;

    //If filter is sent in, set it to the cleaned version, else null
    (req.query.filter != null && req.query.filter != undefined && req.query.filter.length != 0)
        ? cleanFilterSymbol = xss(req.query.filter) : cleanFilterSymbol = null;


    if (cleanUserId > 0 && cleanUserId != null && (cleanSalesOrPurchases == "sales" || cleanSalesOrPurchases == "purchases")) {
        let response = await Transactions.getAllUserStockTransactions(cleanUserId, cleanSalesOrPurchases, cleanFilterSymbol);

        if (response.http_id == 400 || response.http_id == 999) {
            res.status(response.http_id).json(response.message);
        } else {
            res.status(response.http_id).json(response.positions);
        }

    } else {
        res.status(400).json("Bad user input");
    }
})

router.route('/getUserContractHistory').get(async (req: Request, res: Response) => {
    const cleanUserId: number = (req.query.userId != undefined ? +req.query.userId : -1);
    const cleanSalesOrPurchases: string = xss(req.query.salesOrPurchases);

    //String if sent in, null if not sent in,
    let cleanFilterSymbol: string | null;

    //If filter is sent in, set it to the cleaned version, else null
    (req.query.filter != null && req.query.filter != undefined && req.query.filter.length != 0)
        ? cleanFilterSymbol = xss(req.query.filter) : cleanFilterSymbol = null;


    if (cleanUserId > 0 && cleanUserId != null && (cleanSalesOrPurchases == "sales" || cleanSalesOrPurchases == "purchases")) {
        let response = await Transactions.getAllUserContractTransactions(cleanUserId, cleanSalesOrPurchases, cleanFilterSymbol);

        if (response.http_id == 400 || response.http_id == 999) {
            res.status(response.http_id).json(response.message);
        } else {
            res.status(response.http_id).json(response.positions);
        }

    } else {
        res.status(400).json("Bad user input");
    }
})


/**
 * Sets a specific option to be expired
 */
router.route("/setOptionToExpired").post(async (req: Request, res: Response) => {
    const cleanUserId: number = +(xss(req.body.userId));
    const cleanOptionSymbol: string = xss(req.body.optionSymbol);

    if (cleanOptionSymbol != null && cleanUserId != 0 && cleanUserId != null && cleanOptionSymbol.length != 0) {
        let response = await Transactions.setOptionToExpired(cleanUserId, cleanOptionSymbol);

        res.status(response.http_id).json(response.message);
    } else res.status(400).json("Bad input");
})
module.exports = router