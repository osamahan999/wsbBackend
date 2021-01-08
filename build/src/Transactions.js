"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var pool = require('../../config/mysqlConnector.js'); //connection pool
var LoginAndRegisteration = require("./LoginAndRegistration");
var api = require('../../config/apiTokens');
var axios = require('axios');
/**
 * Checks if user is authenticated. If so purchases a stock if the user has the money.
 *
 *
 * @param token login token
 * @param password password -> hashed and checked with token-corresponding user to authenticate
 * @param stockSymbol //ex TSLA
 * @param stockName  //ex Alphabet Inc
 * @param stockPrice //A double with a max value of 999999:99
 * @param amtOfStocks //Integer
 * @param exchange // ex: NYSE
 */
var purchaseStock = function (token, password, stockSymbol, stockName, stockPrice, amtOfStocks, exchange) {
    // join user and user_token and get user data
    var query = "SELECT user.user_id, hashed_password, salt, total_money FROM user_token"
        + " JOIN user ON user.user_id = user_token.user_id WHERE user_token.token = ?";
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, token, function (err, results, fields) {
                    if (err)
                        reject({ http_id: 400, message: "Failed to get user" });
                    else {
                        //check if token applies to any user
                        if (results[0] == null || results[0].length == 0) {
                            reject({ http_id: 400, message: "Authentication failed" });
                        }
                        else {
                            var hashed_password = results[0].hashed_password;
                            var salt = results[0].salt;
                            //authenticate user based on token and password input
                            if (LoginAndRegisteration.hash(password, salt) == hashed_password) {
                                var totalMoney = +results[0].total_money;
                                var userId = +results[0].user_id;
                                var totalCost = amtOfStocks * stockPrice;
                                //input = userId, stockSymbol, stockName, stockCost, exchangeName, amtOfStocks, costOfStocks, totalMoney
                                //Checks if user has enough money for this transaction
                                //Gets id of exchange; if does not exist, inserts it.
                                //Gets id of stock in this exchange; if does not exist, inserts it
                                //Purchases stock for the user
                                var query_1 = "CALL purchase_stock(?, ?, ?, ?, ?, ?, ?, ?)";
                                var input = [userId, stockSymbol, stockName, stockPrice, exchange, amtOfStocks, totalCost, totalMoney];
                                connection.query(query_1, input, function (err, results, fields) {
                                    if (err) {
                                        reject({ http_id: 400, message: "Failed to purchase stock" });
                                    }
                                    else {
                                        resolve({ http_id: 200, message: "Purchase successful" });
                                    }
                                });
                            }
                            else {
                                reject({ http_id: 400, message: "Authentication failed" });
                            }
                        }
                    }
                });
            }
            connection.release();
        });
    }).then(function (json) {
        return json;
    }).catch(function (err) {
        return err;
    });
};
var sellStock = function (userId, purchaseId, amtToSell, costOfStock) {
    var query = "CALL sell_stock(?, ?, ?, ?)";
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, [userId, purchaseId, amtToSell, costOfStock], function (err, results, fields) {
                    if (err)
                        reject({ http_id: 400, message: "Failed to sell stock" });
                    else {
                        resolve({ http_id: 200, message: "Sold successful" });
                    }
                });
            }
        });
    }).catch(function (err) {
        return err;
    });
};
/**
 * Checks if user is authenticated. If so purchases a stock if the user has the money.
 *
 *
 * @param token login token
 * @param password password -> hashed and checked with token-corresponding user to authenticate
 * @param stockSymbol //ex TSLA
 * @param stockName  //ex Alphabet Inc
 * @param stockPrice //A double with a max value of 999999:99
 * @param amtOfStocks //Integer
 * @param exchange // ex: NYSE
 */
var purchaseOption = function (token, password, optionSymbol, optionPrice, amtOfContracts) {
    // join user and user_token and get user data
    var query = "SELECT user.user_id, hashed_password, salt, total_money FROM user_token"
        + " JOIN user ON user.user_id = user_token.user_id WHERE user_token.token = ?";
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, token, function (err, results, fields) {
                    if (err)
                        reject({ http_id: 400, message: "Failed to get user" });
                    else {
                        //check if token applies to any user
                        if (results[0] == null || results[0].length == 0) {
                            reject({ http_id: 400, message: "Authentication failed" });
                        }
                        else {
                            var hashed_password = results[0].hashed_password;
                            var salt = results[0].salt;
                            //authenticate user based on token and password input
                            if (LoginAndRegisteration.hash(password, salt) == hashed_password) {
                                var totalMoney = +results[0].total_money;
                                var userId = +results[0].user_id;
                                var totalCost = amtOfContracts * optionPrice;
                                //input = userId, stockSymbol, stockName, stockCost, exchangeName, amtOfStocks, costOfStocks, totalMoney
                                //Checks if user has enough money for this transaction
                                //Gets id of exchange; if does not exist, inserts it.
                                //Gets id of stock in this exchange; if does not exist, inserts it
                                //Purchases stock for the user
                                var query_2 = "CALL purchase_option(?, ?, ?, ?, ?, ?)";
                                var input = [userId, optionSymbol, optionPrice, amtOfContracts, totalCost, totalMoney];
                                connection.query(query_2, input, function (err, results, fields) {
                                    if (err) {
                                        reject({ http_id: 400, message: "Failed to purchase stock" });
                                    }
                                    else {
                                        resolve({ http_id: 200, message: "Purchase successful" });
                                    }
                                });
                            }
                            else {
                                reject({ http_id: 400, message: "Authentication failed" });
                            }
                        }
                    }
                });
            }
            connection.release();
        });
    }).then(function (json) {
        return json;
    }).catch(function (err) {
        return err;
    });
};
/**
 * Get the user's stock positions for a specific ticker
 * @param userId
 * @param stockSymbol
 */
var getUserPositionsSpecificStock = function (userId, stockSymbol) {
    var query = "SELECT * FROM purchase WHERE (user_id = ?) AND (stock_id IN (SELECT stock_id FROM stock WHERE stock_symbol = ?))";
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, [userId, stockSymbol], function (err, results, fields) {
                    if (err)
                        reject({ http_id: 400, message: "Failed to get user positions" });
                    else {
                        resolve({ http_id: 200, message: "success", positions: results });
                    }
                });
            }
            connection.release();
        });
    }).then(function (json) {
        return json;
    }).catch(function (err) {
        return err;
    });
};
/**
 * Get the user's stock positions for a specific ticker
 * @param userId
 * @param stockSymbol
 */
var getUserPositionsSpecificOption = function (userId, optionSymbol) {
    var query = "SELECT option_symbol, date_purchased, price_at_purchase, amt_of_contracts, amt_sold FROM option_purchase NATURAL JOIN contract_option"
        + " WHERE (user_id = ?) AND "
        + "(option_id IN (SELECT option_id FROM contract_option WHERE option_symbol LIKE concat(?, '%')))";
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, [userId, optionSymbol], function (err, results, fields) {
                    if (err) {
                        reject({ http_id: 400, message: "Failed to get user positions" });
                    }
                    else {
                        /**
                         * The option symbols that we need the data for
                         */
                        var symbols = "";
                        for (var i = 0; i < results.length; i++) {
                            symbols += results[i]['option_symbol'];
                            i != results.length - 1 && (symbols += ",");
                        }
                        /**
                         * Get the option details for the options the user owns
                         */
                        axios.get("https://sandbox.tradier.com/v1/markets/quotes", {
                            params: {
                                'symbols': symbols,
                                'greeks': false
                            },
                            headers: {
                                'Authorization': 'Bearer ' + api.getToken(),
                                'Accept': 'application/json'
                            }
                        }).then(function (response) {
                            //build return array
                            var quote = response.data.quotes.quote; //array of jsons
                            //options is our pulled array of jsons
                            var retArr = [];
                            var _loop_1 = function (i) {
                                quote.forEach(function (quoteJSON) {
                                    if (results[i]['option_symbol'] == quoteJSON['symbol']) {
                                        retArr[i] = __assign(__assign({}, results[i]), quoteJSON);
                                    }
                                });
                            };
                            for (var i = 0; i < results.length; i++) {
                                _loop_1(i);
                            }
                            resolve({ http_id: 200, message: "success", positions: retArr });
                        }).catch(function (err) {
                            reject({ http_id: 400, message: "Failed to option data" });
                        });
                    }
                });
            }
            connection.release();
        });
    }).then(function (json) {
        return json;
    }).catch(function (err) {
        return err;
    });
};
module.exports = {
    purchaseStock: purchaseStock,
    purchaseOption: purchaseOption,
    getUserPositionsSpecificStock: getUserPositionsSpecificStock,
    getUserPositionsSpecificOption: getUserPositionsSpecificOption,
    sellStock: sellStock
};
