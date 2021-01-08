"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios = require('axios');
//For api tokens
var api = require('../../config/apiTokens');
/**
 * Finds max of four stocks similar to the input symbol
 *
 * Output http_id:
 * 400: Failed to find
 * 200: Found similarities
 *
 *
 *
 * @param {String} input
 * @return {JSON} {http_id: 200|400, message: 'Success'|'Failed', stocks<Array<JSON>> : [{}]}
 */
var findBySymbol = function (input) {
    return new Promise(function (resolve, reject) {
        axios.get("https://sandbox.tradier.com/v1/markets/search", {
            params: {
                'q': input,
                'indexes': false
            },
            headers: {
                'Authorization': 'Bearer ' + api.getToken(),
                'Accept': 'application/json'
            }
        }).then(function (response) {
            var stocks = (response.data.securities.security);
            var i = stocks.length;
            i > 4 ?
                resolve({ http_id: 200, message: "Success", stocks: stocks.slice(0, 4) })
                : resolve({ http_id: 200, message: "Succes", stocks: stocks });
        }).catch(function (err) {
            reject({ http_id: 400, message: "Failed", stocks: [] });
        });
    }).catch(function (err) {
        return err;
    });
};
/**
 * Finds data of a symbol in regards to input symbol
 *
 * Output http_id:
 * 400: Failed to find
 * 200: Found quote
 *
 *
 *
 * @param {String} input
 * @return {JSON} {http_id: 200|400, message: 'Success'|'Failed', quotes<Array<JSON>> : [{}]}
 */
var getQuoteBySymbol = function (symbol) {
    return new Promise(function (resolve, reject) {
        axios.get("https://sandbox.tradier.com/v1/markets/quotes", {
            params: {
                'symbols': symbol,
                'greeks': true
            },
            headers: {
                'Authorization': 'Bearer ' + api.getToken(),
                'Accept': 'application/json'
            }
        }).then(function (response) {
            var quote = response.data.quotes.quote;
            resolve({ http_id: 200, message: "Success", quotes: quote });
        }).catch(function (err) {
            reject({ http_id: 400, message: "Failed", quotes: [] });
        });
    }).catch(function (err) {
        return err;
    });
};
/**
 * Gets the option expiration dates for a specific stock by ticker
 *
 * @param symbol Stock symbol
 * @return {JSON} {http_id: 200|400, message: 'Success'|'Failed', expirations<Array<JSON>> : [{}]}
 */
var getOptionExpirationsBySymbol = function (symbol) {
    return new Promise(function (resolve, reject) {
        axios.get("https://sandbox.tradier.com/v1/markets/options/expirations", {
            params: {
                'symbol': symbol,
                'greeks': true
            },
            headers: {
                'Authorization': 'Bearer ' + api.getToken(),
                'Accept': 'application/json'
            }
        }).then(function (response) {
            var expirations = response.data.expirations.date;
            resolve({ http_id: 200, message: "Success", expirations: expirations });
        }).catch(function (err) {
            reject({ http_id: 400, message: "Failed", expirations: [] });
        });
    }).catch(function (err) {
        return err;
    });
};
/**
 *
 * @param symbol Stock ticker
 * @param expiration Valid expiration date for said ticker
 * @param optionType call | put | any
 *
 * @return {JSON} {http_id: 200|400, message: "Success"|"Failed", options<Array<JSON>> : [{}]}
 */
var getOptionsOnDate = function (symbol, expiration, optionType) {
    return new Promise(function (resolve, reject) {
        axios.get("https://sandbox.tradier.com/v1/markets/options/chains", {
            params: {
                'symbol': symbol,
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
                resolve({
                    http_id: 200,
                    message: "Success",
                    options: options.filter(function (option) { return option.option_type.includes(optionType); })
                });
            }
            else if (optionType == 'any') {
                resolve({ http_id: 200, message: "Success", options: options });
            }
            else {
                resolve({ http_id: 400, message: "Failed", options: [] });
            }
        }).catch(function (err) {
            reject({ http_id: 400, message: "Failed", options: [] });
        });
    }).catch(function (err) {
        return err;
    });
};
module.exports = {
    findBySymbol: findBySymbol,
    getQuoteBySymbol: getQuoteBySymbol,
    getOptionExpirationsBySymbol: getOptionExpirationsBySymbol,
    getOptionsOnDate: getOptionsOnDate
};
