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
/**
 *
 * @param userId
 * @param purchaseId
 * @param amtToSell
 * @param costOfStock
 *
 * @returns {JSON} {http_id: 999|400|200, message: "Failed to get connection from pool"|"Failed to sell stock"|"Sold successful"}
 */
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
            connection.release();
        });
    }).catch(function (err) {
        return err;
    });
};
/**
 *
 * @param userId
 * @param optionPurchaseId
 * @param amtToSell
 * @param costOfContract
 *
 * @returns {JSON} {http_id: 999|400|200, message: "Failed to get connection from pool"|"Failed to sell contracts"|"Sold successful"}
 */
var sellContract = function (userId, optionPurchaseId, amtToSell, costOfContract) {
    var query = "CALL sell_contract(?, ?, ?, ?)";
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, [userId, optionPurchaseId, amtToSell, (costOfContract * 100)], function (err, results, fields) {
                    if (err || (results[0] != null && results[0][0].Error))
                        reject({ http_id: 400, message: "Failed to sell contracts" });
                    else {
                        resolve({ http_id: 200, message: "Sold successful" });
                    }
                });
            }
            connection.release();
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
 * @param stockSymbol string or null -> if null, returns all stock positions, else returns the specific symbol
 *
 * @returns {JSON} {http_id : 200|400|999, message: "success" | "Failed to get user positions" | "Failed to get connection from pool", positions: [{}]}
 */
var getUserPositionsSpecificStockOrAll = function (userId, stockSymbol) {
    var query;
    var input;
    if (stockSymbol == null) {
        query = "SELECT * FROM purchase NATURAL JOIN stock WHERE (user_id = ?) AND (amt_of_purchase != amt_sold) ORDER BY date_purchased DESC"; //all stock positions not sold
        input = [userId];
    }
    else {
        query = "SELECT * FROM purchase NATURAL JOIN stock WHERE (user_id = ?) AND (stock_symbol = ?) AND (amt_of_purchase != amt_sold) ORDER BY date_purchased DESC";
        input = [userId, stockSymbol];
    }
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, input, function (err, results, fields) {
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
var getUserPositionsSpecificOptionOrAll = function (userId, optionSymbol) {
    var query;
    var input;
    if (optionSymbol == null) {
        query = "SELECT * FROM option_purchase NATURAL JOIN contract_option WHERE (amt_of_contracts != amt_sold) AND user_id = ? ORDER BY date_purchased DESC";
        input = [userId];
    }
    else {
        query = "SELECT * FROM option_purchase NATURAL JOIN contract_option WHERE" +
            " (amt_of_contracts != amt_sold) AND (user_id = ?) AND (option_symbol LIKE concat(?, '%')) ORDER BY date_purchased DESC";
        input = [userId, optionSymbol];
    }
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, input, function (err, results, fields) {
                    if (err) {
                        reject({ http_id: 400, message: "Failed to get user positions" });
                    }
                    else {
                        if (results.length != null && results.length != 0) {
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
                                if (quote instanceof Array) {
                                    //options is our pulled array of jsons
                                    var retArr_1 = [];
                                    var _loop_1 = function (i) {
                                        quote.forEach(function (quoteJSON) {
                                            if (results[i]['option_symbol'] == quoteJSON['symbol']) {
                                                retArr_1[i] = __assign(__assign({}, results[i]), quoteJSON);
                                            }
                                        });
                                    };
                                    for (var i = 0; i < results.length; i++) {
                                        _loop_1(i);
                                    }
                                    resolve({ http_id: 200, message: "success", positions: retArr_1 });
                                }
                                else {
                                    //If only one option
                                    resolve({ http_id: 200, message: "success", positions: [__assign(__assign({}, results[0]), quote)] });
                                }
                            }).catch(function (err) {
                                reject({ http_id: 400, message: "Failed to get option data" });
                            });
                        }
                        else {
                            resolve({ http_id: 200, message: "success", positions: [] });
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
 *
 * @param userId User ID to
 *
 * @returns {JSON} {http_id: 999|400|200,
 *                  message: "Failed to get connection from pool"|"Error getting user stock transactions"| "Success",
 *                  positions<Array<JSON>> : ({})}
 */
var getAllUserStockTransactions = function (userId, cleanSalesOrPurchases, cleanFilterSymbol) {
    var query;
    var input;
    ///If sales, we pull all the sales; if purchases, we pull purchases
    //for each sale, there is a purchase. This is how we get the net $ they made or lost
    cleanSalesOrPurchases == "sales" ?
        query = "SELECT * FROM stock_sell NATURAL JOIN stock INNER JOIN purchase "
            + " ON purchase.purchase_id = stock_sell.purchase_id WHERE stock_sell.amt_sold != 0 AND stock_sell.user_id = ? "
        :
            query = "SELECT * FROM purchase NATURAL JOIN stock WHERE purchase.user_id = ? ";
    //There is a filter symbol, so we add the wildcard search
    if (cleanFilterSymbol != null) {
        query += "  AND stock_symbol LIKE CONCAT(?, '%') ";
        input = [userId, cleanFilterSymbol];
    }
    else {
        input = [userId];
    }
    //Order by the correct value per sales or purchases
    cleanSalesOrPurchases == "sales" ? query += " ORDER BY date_sold DESC" : query += " ORDER BY date_purchased DESC";
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, input, function (err, results, fields) {
                    if (err)
                        reject({ http_id: 400, message: "Error getting user stock transactions" });
                    else {
                        resolve({ http_id: 200, message: "Success", positions: results });
                    }
                });
            }
            connection.release();
        });
    }).then(function (json) { return json; })
        .catch(function (err) { return err; });
};
/**
 *
 * @param userId
 *
 * @returns {JSON} {http_id:999, 400, 200,
 *                  message: "Failed to get connection from pool"| "Error getting user contract transactions"| "Success",
 *                  positions<Array<JSON>> : [{}]
 *                  }
 */
var getAllUserContractTransactions = function (userId, cleanSalesOrPurchases, cleanFilterSymbol) {
    var query;
    var input;
    //To get sales or purchases
    cleanSalesOrPurchases == "sales" ? query = "SELECT * FROM sell_option NATURAL JOIN contract_option "
        + " INNER JOIN option_purchase ON sell_option.option_purchase_id = option_purchase.option_purchase_id "
        + " WHERE sell_option.amt_sold != 0 AND sell_option.user_id = ?  "
        :
            query = "SELECT * FROM option_purchase NATURAL JOIN contract_option WHERE user_id = ? ";
    //Whether to filter or not
    if (cleanFilterSymbol != null) {
        query += " AND contract_option.option_symbol LIKE CONCAT(?, '%') ";
        input = [userId, cleanFilterSymbol];
    }
    else {
        input = [userId];
    }
    //Order by the correct value per sales or purchases
    cleanSalesOrPurchases == "sales" ? query += " ORDER BY sell_option.date_sold DESC" : query += " ORDER BY option_purchase.date_purchased DESC";
    return new Promise(function (resolve, reject) {
        pool.getConnection(function (error, connection) {
            if (error)
                reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, input, function (err, results, fields) {
                    if (err)
                        reject({ http_id: 400, message: "Error getting user contract transactions" });
                    else {
                        resolve({ http_id: 200, message: "Success", positions: results });
                    }
                });
            }
            connection.release();
        });
    }).then(function (json) { return json; })
        .catch(function (err) { return err; });
};
module.exports = {
    purchaseStock: purchaseStock,
    purchaseOption: purchaseOption,
    getUserPositionsSpecificStockOrAll: getUserPositionsSpecificStockOrAll,
    getUserPositionsSpecificOptionOrAll: getUserPositionsSpecificOptionOrAll,
    sellStock: sellStock,
    sellContract: sellContract,
    getAllUserStockTransactions: getAllUserStockTransactions,
    getAllUserContractTransactions: getAllUserContractTransactions
};
