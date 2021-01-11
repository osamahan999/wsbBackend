
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

const axios: AxiosInstance = require('axios');


//For api tokens
const api = require('../../config/apiTokens');


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
const findBySymbol = (input: string) => {

    return new Promise((resolve, reject) => {
        axios.get("https://sandbox.tradier.com/v1/markets/search", {
            params: {
                'q': input,
                'indexes': false
            },
            headers: {
                'Authorization': 'Bearer ' + api.getToken(),
                'Accept': 'application/json'
            }
        }).then((response: AxiosResponse) => {
            let stocks: Array<JSON> = (response.data.securities.security);
            let i = stocks.length;

            i > 4 ?
                resolve({ http_id: 200, message: "Success", stocks: stocks.slice(0, 4) })
                : resolve({ http_id: 200, message: "Succes", stocks: stocks });


        }).catch((err: AxiosError) => {

            reject({ http_id: 400, message: "Failed", stocks: [] });

        })
    }).catch((err) => {
        return err;
    })
}




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
const getQuoteBySymbol = (symbol: string) => {
    return new Promise((resolve, reject) => {
        axios.get("https://sandbox.tradier.com/v1/markets/quotes", {
            params: {
                'symbols': symbol,
                'greeks': true
            },
            headers: {
                'Authorization': 'Bearer ' + api.getToken(),
                'Accept': 'application/json'
            }
        }).then((response: AxiosResponse) => {
            let quote: JSON = response.data.quotes.quote;
            resolve({ http_id: 200, message: "Success", quotes: quote });

        }).catch((err: AxiosError) => {
            console.log(err);
            reject({ http_id: 400, message: "Failed", quotes: [] });

        })


    }).catch((err) => {
        return err;
    })
}

/**
 * Gets the option expiration dates for a specific stock by ticker
 * 
 * @param symbol Stock symbol
 * @return {JSON} {http_id: 200|400, message: 'Success'|'Failed', expirations<Array<JSON>> : [{}]}
 */
const getOptionExpirationsBySymbol = (symbol: string) => {
    return new Promise((resolve, reject) => {
        axios.get("https://sandbox.tradier.com/v1/markets/options/expirations", {
            params: {
                'symbol': symbol,
                'greeks': true
            },
            headers: {
                'Authorization': 'Bearer ' + api.getToken(),
                'Accept': 'application/json'
            }
        }).then((response: AxiosResponse) => {
            let expirations: Array<JSON> = response.data.expirations.date;
            resolve({ http_id: 200, message: "Success", expirations: expirations });

        }).catch((err: AxiosError) => {
            reject({ http_id: 400, message: "Failed", expirations: [] });
        })
    }).catch((err) => {
        return err;
    })
}



/**
 * 
 * @param symbol Stock ticker
 * @param expiration Valid expiration date for said ticker
 * @param optionType call | put | any
 * 
 * @return {JSON} {http_id: 200|400, message: "Success"|"Failed", options<Array<JSON>> : [{}]}
 */
const getOptionsOnDate = (symbol: string, expiration: string, optionType: string) => {
    return new Promise((resolve, reject) => {
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
        }).then((response: AxiosResponse) => {
            let options: Array<JSON> = response.data.options.option;


            /**
            * If optionType is call or put, return the options filtered for the specified type
            */

            if (optionType == 'call' || optionType == 'put') {
                resolve({
                    http_id: 200,
                    message: "Success",
                    options: options.filter((option: JSON | any) => option.option_type.includes(optionType))
                });
            }
            else if (optionType == 'any') {
                resolve({ http_id: 200, message: "Success", options: options })
            } else {
                resolve({ http_id: 400, message: "Failed", options: [] })
            }


        }).catch((err: AxiosError) => {
            reject({ http_id: 400, message: "Failed", options: [] });
        })
    }).catch((err) => {
        return err;
    })
}


module.exports = {
    findBySymbol,
    getQuoteBySymbol,
    getOptionExpirationsBySymbol,
    getOptionsOnDate
}
