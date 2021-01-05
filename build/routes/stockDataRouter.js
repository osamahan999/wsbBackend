"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var router = require('express').Router();
var xss = require('xss'); //used for cleaning user input
//For api tokens
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
 * Gets you all expiration dates
 * @param {string} symbol
 * @returns {array<string>} dates
 */
router.route('/getExpirations').get(function (req, res) {
    var stock = xss(req.query.symbol);
    axios.get("https://sandbox.tradier.com/v1/markets/options/expirations", {
        params: {
            'symbol': stock
        },
        headers: {
            'Authorization': 'Bearer ' + api.getToken(),
            'Accept': 'application/json'
        }
    }).then(function (response) {
        res.json(response.data.expirations.date);
    }).catch(function (error) {
        res.status(400).json("Error getting dates");
    });
});
/**
 * Gets option chains for a specific symbol with specific expiration for either call, put, or both
 *
 * @param {string} symbol
 * @param {string} expiration
 * @param {string} optionType //'call' for calls, 'put' for puts, 'all' for both
 *
 * @returns {array<JSON>} option chain
 */
router.route('/getOptionsOnDate').get(function (req, res) {
    var stock = xss(req.query.symbol);
    var expiration = xss(req.query.expiration);
    var optionType = xss(req.query.optionType);
    axios.get("https://sandbox.tradier.com/v1/markets/options/chains", {
        params: {
            'symbol': stock,
            'expiration': expiration,
            'greeks': true
        },
        headers: {
            'Authorization': 'Bearer ' + api.getToken(),
            'Accept': 'application/json'
        }
    }).then(function (response) {
        var options = response.data.options.option;
        /**
         * If optionType is call or put, return the options filtered for the specified type
         */
        if (optionType == 'call' || optionType == 'put') {
            res.json(options.filter(function (option) { return option.option_type.includes(optionType); }));
        }
        else if (optionType == 'any') {
            res.json(options);
        }
        else {
            res.status(400).json("Invalid option type");
        }
    }).catch(function (err) {
        res.status(400).json("Error getting options");
    });
});
module.exports = router;
