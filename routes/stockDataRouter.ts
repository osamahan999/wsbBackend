
import { Request, Response } from "express";

const router = require('express').Router();

const xss = require('xss'); //used for cleaning user input
const StockData = require('../src/StockData');


/**
 * 
 * Searches for stocks that match the input from the user
 * 
 * @param {string} input
 * @return {Array<JSON>} stocks 
 */
router.route('/searchBySymbol').get(async (req: Request, res: Response) => {

    let searchInput: string = xss(req.query.input);

    let response = await StockData.findBySymbol(searchInput);

    res.status(response.http_id).json(response.stocks);

})


/**
 * Gets a stock's quote by taking in the symbol for said stock
 * @param {string} stock
 * @return {JSON} quote
 */
router.route('/getStockQuote').get(async (req: Request, res: Response) => {

    let stock: string = xss(req.query.symbol);
    let response = await StockData.getQuoteBySymbol(stock);

    res.status(response.http_id).json(response.quotes);


})




/**
 * Gets you all expiration dates
 * @param {string} symbol
 * @returns {array<string>} dates
 */
router.route('/getExpirations').get(async (req: Request, res: Response) => {
    let stock: string = xss(req.query.symbol);


    let response = await StockData.getOptionExpirationsBySymbol(stock);

    res.status(response.http_id).json(response.expirations);
})


/**
 * Gets option chains for a specific symbol with specific expiration for either call, put, or both
 * 
 * @param {string} symbol
 * @param {string} expiration //ex : '2021-01-08'
 * @param {string} optionType //'call' for calls, 'put' for puts, 'all' for both
 * 
 * @returns {array<JSON>} option chain
 */
router.route('/getOptionsOnDate').get(async (req: Request, res: Response) => {

    let stock: string = xss(req.query.symbol);
    let expiration: string = xss(req.query.expiration);
    let optionType: string = xss(req.query.optionType);

    let response = await StockData.getOptionsOnDate(stock, expiration, optionType);

    res.status(response.http_id).json(response.options);
})





module.exports = router