"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router = require('express').Router();
var xss = require('xss'); //used for cleaning user input
var api = require('../../config/apiTokens');
var axios = require('axios').default;
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
router.route('/searchBySymbol').get(function (req, res) {
    var searchInput = xss(req.query.input);
    axios.get("https://sandbox.tradier.com/v1/markets/search", {
        params: {
            'q': searchInput,
            'indexes': false
        },
        headers: {
            'Authorization': 'Bearer ' + api.getToken(),
            'Accept': 'application/json'
        }
    }).then(function (response) {
        var stocks = (response.data.securities.security);
        var i = stocks.length;
        i > 4 ? res.json(stocks.slice(0, 4)) : res.json(stocks);
    }).catch(function (err) {
        res.status(400).json("empty");
    });
});
/**
 * Gets a stock's quote by taking in the symbol for said stock
 * @param {string} stock
 * @return {JSON} quote
 */
router.route('/getStockQuote').get(function (req, res) {
    var stock = xss(req.query.symbol);
    axios.get("https://sandbox.tradier.com/v1/markets/quotes", {
        params: {
            'symbols': stock,
            'greeks': true
        },
        headers: {
            'Authorization': 'Bearer ' + api.getToken(),
            'Accept': 'application/json'
        }
    }).then(function (response) {
        var quote = response.data.quotes.quote;
        console.log(response.data);
        res.json(quote);
    }).catch(function (err) {
        res.status(400).json(err);
    });
});
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
router.route('/getOptions').get(function (req, res) {
    var stock = xss(req.query.symbol);
    axios.get("https://sandbox.tradier.com/v1/markets/options/lookup", {
        params: {
            'underlying': stock
        },
        headers: {
            'Authorization': 'Bearer ' + api.getToken(),
            'Accept': 'application/json'
        }
    }).then(function (response) {
        var options = response.data.symbols[0].options;
        var len = options.length;
        len > 2100 ? res.json(options.slice(0, 2100)) : res.json(options);
    }).catch(function (err) {
        res.status(400).json(err);
    });
});
module.exports = router;
