
import { MysqlError, Pool, PoolConnection } from 'mysql';

const pool: Pool = require('../../config/mysqlConnector.js'); //connection pool


/**
 * Deletes a login token
 * @param token Login token
 */
const purchaseStock = (token: string, 
    password: string, 
    stockSymbol : string,
    stockName : string,
    stockPrice : number,
    amtOfStocks : number,
    exchange : string  ) => {

    //TODO: authenticate user first and pull their totalMoney and userId and salt


    // join user and user_token and get user data
    const query: string = "SELECT user.user_id, hashed_password, salt, total_money FROM user_token" 
    + " JOIN user ON user.user_id = user_token.user_id WHERE user_token.token = ?";



    return new Promise((resolve, reject) => {

        pool.getConnection((error : MysqlError, connection : PoolConnection) => {
            if (error) reject({http_id: 999, message: "Failed to get connection from pool"});
            else {
                connection.query(query, token, (err, results, fields) => {
                    if (err) reject({http_id: 400, message: "Failed to get user"});
                    else {

                        //hash inpput password with salt and check if it matches.

                        //if so, call the procedure to add stock

                        resolve({http_id:200, message: "Token deleted successfully"});
                    }




                })
            }

            connection.release();

        })
    });



}


module.exports = {
    purchaseStock
}
