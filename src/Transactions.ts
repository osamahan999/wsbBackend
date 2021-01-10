
import { AxiosError, AxiosResponse } from 'axios';
import { MysqlError, Pool, PoolConnection } from 'mysql';

const pool: Pool = require('../../config/mysqlConnector.js'); //connection pool
const LoginAndRegisteration = require("./LoginAndRegistration");

const api = require('../../config/apiTokens');
const axios = require('axios');


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
const purchaseStock = (
    token: string,
    password: string,
    stockSymbol: string,
    stockName: string,
    stockPrice: number,
    amtOfStocks: number,
    exchange: string) => {



    // join user and user_token and get user data
    const query: string = "SELECT user.user_id, hashed_password, salt, total_money FROM user_token"
        + " JOIN user ON user.user_id = user_token.user_id WHERE user_token.token = ?";



    return new Promise((resolve, reject) => {

        pool.getConnection((error: MysqlError, connection: PoolConnection) => {
            if (error) reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, token, (err, results, fields) => {
                    if (err) reject({ http_id: 400, message: "Failed to get user" });
                    else {

                        //check if token applies to any user
                        if (results[0] == null || results[0].length == 0) {
                            reject({ http_id: 400, message: "Authentication failed" });
                        } else {
                            const hashed_password: string = results[0].hashed_password;
                            const salt: string = results[0].salt;


                            //authenticate user based on token and password input
                            if (LoginAndRegisteration.hash(password, salt) == hashed_password) {
                                const totalMoney: number = +results[0].total_money;
                                const userId: number = +results[0].user_id;

                                const totalCost: number = amtOfStocks * stockPrice;

                                //input = userId, stockSymbol, stockName, stockCost, exchangeName, amtOfStocks, costOfStocks, totalMoney
                                //Checks if user has enough money for this transaction
                                //Gets id of exchange; if does not exist, inserts it.
                                //Gets id of stock in this exchange; if does not exist, inserts it
                                //Purchases stock for the user
                                const query: string = "CALL purchase_stock(?, ?, ?, ?, ?, ?, ?, ?)";
                                const input: Array<string | number> = [userId, stockSymbol, stockName, stockPrice, exchange, amtOfStocks, totalCost, totalMoney];

                                connection.query(query, input, (err, results, fields) => {
                                    if (err) {
                                        reject({ http_id: 400, message: "Failed to purchase stock" });
                                    }
                                    else {
                                        resolve({ http_id: 200, message: "Purchase successful" });
                                    }

                                })
                            } else {
                                reject({ http_id: 400, message: "Authentication failed" });
                            }

                        }
                    }
                })
            }
            connection.release();
        })
    }).then((json) => {
        return json;
    }).catch((err) => {
        return err;
    })
}


/**
 * 
 * @param userId 
 * @param purchaseId 
 * @param amtToSell 
 * @param costOfStock 
 * 
 * @returns {JSON} {http_id: 999|400|200, message: "Failed to get connection from pool"|"Failed to sell stock"|"Sold successful"}
 */
const sellStock = (userId: number, purchaseId: number,
    amtToSell: number, costOfStock: number) => {

    const query = "CALL sell_stock(?, ?, ?, ?)";

    return new Promise((resolve, reject) => {
        pool.getConnection((error: MysqlError, connection: PoolConnection) => {
            if (error) reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, [userId, purchaseId, amtToSell, costOfStock],
                    (err, results, fields) => {

                        if (err) reject({ http_id: 400, message: "Failed to sell stock" });
                        else {
                            resolve({ http_id: 200, message: "Sold successful" });
                        }
                    })
            }
        })
    }).catch(err => {
        return err
    });

}



/**
 * 
 * @param userId 
 * @param optionPurchaseId 
 * @param amtToSell 
 * @param costOfContract
 * 
 * @returns {JSON} {http_id: 999|400|200, message: "Failed to get connection from pool"|"Failed to sell contracts"|"Sold successful"}
 */
const sellContract = (userId: number, optionPurchaseId: number,
    amtToSell: number, costOfContract: number) => {

    const query = "CALL sell_contract(?, ?, ?, ?)";



    return new Promise((resolve, reject) => {
        pool.getConnection((error: MysqlError, connection: PoolConnection) => {
            if (error) reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, [userId, optionPurchaseId, amtToSell, (costOfContract * 100)],
                    (err, results, fields) => {
                        if (err || (results[0] != null && results[0][0].Error)) reject({ http_id: 400, message: "Failed to sell contracts" });
                        else {
                            resolve({ http_id: 200, message: "Sold successful" });
                        }
                    })
            }
        })
    }).catch(err => {
        return err
    });

}





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
const purchaseOption = (
    token: string,
    password: string,

    optionSymbol: string,
    optionPrice: number,
    amtOfContracts: number) => {



    // join user and user_token and get user data
    const query: string = "SELECT user.user_id, hashed_password, salt, total_money FROM user_token"
        + " JOIN user ON user.user_id = user_token.user_id WHERE user_token.token = ?";



    return new Promise((resolve, reject) => {

        pool.getConnection((error: MysqlError, connection: PoolConnection) => {
            if (error) reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, token, (err, results, fields) => {
                    if (err) reject({ http_id: 400, message: "Failed to get user" });
                    else {

                        //check if token applies to any user
                        if (results[0] == null || results[0].length == 0) {
                            reject({ http_id: 400, message: "Authentication failed" });
                        } else {
                            const hashed_password: string = results[0].hashed_password;
                            const salt: string = results[0].salt;


                            //authenticate user based on token and password input
                            if (LoginAndRegisteration.hash(password, salt) == hashed_password) {
                                const totalMoney: number = +results[0].total_money;
                                const userId: number = +results[0].user_id;

                                const totalCost: number = amtOfContracts * optionPrice;

                                //input = userId, stockSymbol, stockName, stockCost, exchangeName, amtOfStocks, costOfStocks, totalMoney
                                //Checks if user has enough money for this transaction
                                //Gets id of exchange; if does not exist, inserts it.
                                //Gets id of stock in this exchange; if does not exist, inserts it
                                //Purchases stock for the user
                                const query: string = "CALL purchase_option(?, ?, ?, ?, ?, ?)";
                                const input: Array<string | number> = [userId, optionSymbol, optionPrice, amtOfContracts, totalCost, totalMoney];

                                connection.query(query, input, (err, results, fields) => {
                                    if (err) {
                                        reject({ http_id: 400, message: "Failed to purchase stock" });
                                    }
                                    else {
                                        resolve({ http_id: 200, message: "Purchase successful" });
                                    }

                                })
                            } else {
                                reject({ http_id: 400, message: "Authentication failed" });
                            }

                        }
                    }
                })
            }
            connection.release();
        })
    }).then((json) => {
        return json;
    }).catch((err) => {
        return err;
    })
}



/**
 * Get the user's stock positions for a specific ticker
 * @param userId 
 * @param stockSymbol string or null -> if null, returns all stock positions, else returns the specific symbol
 * 
 * @returns {JSON} {http_id : 200|400|999, message: "success" | "Failed to get user positions" | "Failed to get connection from pool", positions: [{}]}
 */
const getUserPositionsSpecificStockOrAll = (userId: number, stockSymbol: string | null) => {

    let query: string;

    stockSymbol == null
        ? query = "SELECT * FROM purchase WHERE (user_id = ?) AND (amt_of_purchase != amt_sold)" //all stock positions not sold
        : query = "SELECT * FROM purchase WHERE (user_id = ?) AND (stock_id IN (SELECT stock_id FROM stock WHERE stock_symbol = ?)) AND (amt_of_purchase != amt_sold)";


    return new Promise((resolve, reject) => {

        pool.getConnection((error: MysqlError, connection: PoolConnection) => {
            if (error) reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, [userId, stockSymbol], (err, results, fields) => {
                    if (err)
                        reject({ http_id: 400, message: "Failed to get user positions" });
                    else {
                        resolve({ http_id: 200, message: "success", positions: results })

                    }
                })
            }
            connection.release();
        })
    }).then((json) => {
        return json;
    }).catch((err) => {
        return err;
    })
}

/**
 * Get the user's stock positions for a specific ticker
 * @param userId 
 * @param stockSymbol 
 */
const getUserPositionsSpecificOption = (userId: number, optionSymbol: string) => {


    const query = "SELECT * FROM option_purchase NATURAL JOIN contract_option"
        + " WHERE (amt_of_contracts != amt_sold) AND (user_id = ?) AND (option_symbol LIKE concat(?, '%'))";


    return new Promise((resolve, reject) => {

        pool.getConnection((error: MysqlError, connection: PoolConnection) => {
            if (error) reject({ http_id: 999, message: "Failed to get connection from pool" });
            else {
                connection.query(query, [userId, optionSymbol], (err, results, fields) => {
                    if (err) {
                        reject({ http_id: 400, message: "Failed to get user positions" });
                    }
                    else {

                        if (results.length != null && results.length != 0) {

                            /**
                                                    * The option symbols that we need the data for
                                                    */
                            let symbols: string = "";
                            for (let i = 0; i < results.length; i++) {
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
                            }).then((response: AxiosResponse) => {

                                //build return array
                                let quote: Array<JSON> | JSON = response.data.quotes.quote; //array of jsons

                                if (quote instanceof Array) {
                                    //options is our pulled array of jsons


                                    let retArr: Array<JSON | any> = [];

                                    for (let i: number = 0; i < results.length; i++) {


                                        quote.forEach((quoteJSON: JSON | any) => {
                                            if (results[i]['option_symbol'] == quoteJSON['symbol']) {
                                                retArr[i] = { ...results[i], ...quoteJSON };
                                            }
                                        })
                                    }

                                    resolve({ http_id: 200, message: "success", positions: retArr })
                                } else {
                                    //If only one option
                                    resolve({ http_id: 200, message: "success", positions: [{ ...results[0], ...quote }] })
                                }


                            }).catch((err: AxiosError) => {
                                reject({ http_id: 400, message: "Failed to get option data" });

                            })

                        } else {
                            resolve({ http_id: 200, message: "success", positions: [] })

                        }



                    }
                })
            }
            connection.release();
        })
    }).then((json) => {
        return json;
    }).catch((err) => {
        return err;
    })


}


module.exports = {
    purchaseStock,
    purchaseOption,
    getUserPositionsSpecificStockOrAll,
    getUserPositionsSpecificOption,
    sellStock,
    sellContract
}
