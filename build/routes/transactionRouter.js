"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var router = require('express').Router();
var xss = require('xss'); //used for cleaning user input
var Transactions = require('../src/Transactions');
var StockData = require('../src/StockData');
var api = require('../../config/apiTokens');
/**
 * User calls this with their login token to make a purchase.
 *
 * I assume this is extremely insecure but I'm not sure how real payment systems handle this. Do you ask them for their password each time?
 *
 * TODO: get cost of stock from API to make sure they paying right amt. Can do this, but this doubles my api calls so not doing it
 */
router.route('/purchaseStock').post(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cleanToken, cleanPassword, cleanStockSymbol, cleanStockName, cleanAmtOfStocks, cleanExchange, costOfStock, response_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cleanToken = xss(req.body.token);
                cleanPassword = xss(req.body.password);
                cleanStockSymbol = xss(req.body.stockSymbol);
                cleanStockName = xss(req.body.stockName);
                cleanAmtOfStocks = +xss(req.body.amtOfStocks);
                cleanExchange = xss(req.body.exchange);
                return [4 /*yield*/, StockData.getQuoteBySymbol(cleanStockSymbol)];
            case 1:
                costOfStock = +(_a.sent()).quotes.ask;
                if (!(costOfStock != 0 && cleanStockName.length != 0
                    && cleanAmtOfStocks != 0 && cleanExchange.length != 0
                    && cleanToken.length != 0 && cleanPassword.length != 0
                    && cleanAmtOfStocks > 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, Transactions.purchaseStock(cleanToken, cleanPassword, cleanStockSymbol, cleanStockName, costOfStock, cleanAmtOfStocks, cleanExchange)];
            case 2:
                response_1 = _a.sent();
                if (response_1.http_id == 400 || response_1.http_id == 999)
                    res.status(response_1.http_id).json(response_1.message);
                else {
                    res.json(response_1.message);
                }
                return [3 /*break*/, 4];
            case 3:
                res.status(400).json("Inputs are invalid");
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Sell a stock
 */
router.route('/sellStock').post(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cleanUserId, cleanPurchaseId, cleanAmtToSell, cleanStockSymbol, costOfStock, response_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cleanUserId = +xss(req.body.userId);
                cleanPurchaseId = +xss(req.body.purchaseId);
                cleanAmtToSell = +xss(req.body.amtToSell);
                cleanStockSymbol = xss(req.body.stockSymbol);
                return [4 /*yield*/, StockData.getQuoteBySymbol(cleanStockSymbol)];
            case 1:
                costOfStock = +(_a.sent()).quotes.ask;
                if (!(cleanUserId >= 0 &&
                    (cleanStockSymbol != undefined && cleanStockSymbol.length != 0)
                    && cleanAmtToSell != 0 && cleanPurchaseId >= 0 &&
                    (costOfStock != undefined && costOfStock >= 0))) return [3 /*break*/, 3];
                return [4 /*yield*/, Transactions.sellStock(cleanUserId, cleanPurchaseId, cleanAmtToSell, costOfStock)];
            case 2:
                response_2 = _a.sent();
                res.status(response_2.http_id).json(response_2.message);
                return [3 /*break*/, 4];
            case 3:
                res.status(400).json("Bad input");
                _a.label = 4;
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * Sell contracts
 */
router.route('/sellContract').post(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cleanUserId, cleanOptionPurchaseId, cleanAmtToSell, cleanOptionSymbol, costOfContract, response_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cleanUserId = +xss(req.body.userId);
                cleanOptionPurchaseId = +xss(req.body.optionPurchaseId);
                cleanAmtToSell = +xss(req.body.amtToSell);
                cleanOptionSymbol = xss(req.body.optionSymbol);
                return [4 /*yield*/, (StockData.getQuoteBySymbol(cleanOptionSymbol))];
            case 1:
                costOfContract = +(_a.sent()).quotes.ask;
                if (!isNaN(costOfContract)) return [3 /*break*/, 2];
                res.status(400).json("Expired");
                return [3 /*break*/, 5];
            case 2:
                if (!(cleanUserId >= 0 &&
                    (cleanOptionSymbol != undefined && cleanOptionSymbol.length != 0)
                    && cleanAmtToSell != 0 && cleanOptionPurchaseId >= 0 &&
                    (costOfContract != undefined && costOfContract >= 0))) return [3 /*break*/, 4];
                return [4 /*yield*/, Transactions.sellContract(cleanUserId, cleanOptionPurchaseId, cleanAmtToSell, costOfContract)];
            case 3:
                response_3 = _a.sent();
                res.status(response_3.http_id).json(response_3.message);
                return [3 /*break*/, 5];
            case 4:
                res.status(400).json("Bad input");
                _a.label = 5;
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * User calls this with their login token to make a purchase of an option.
 *
 *
 */
router.route('/purchaseOption').post(function (req, res) {
    //used for authentication
    var cleanToken = xss(req.body.token);
    var cleanPassword = xss(req.body.password);
    //used for purchase
    var cleanOptionSymbol = xss(req.body.optionSymbol);
    var cleanOptionPrice = +xss(req.body.optionPrice); //+'string' casts to number
    var cleanAmtOfContracts = +xss(req.body.amtOfContracts);
    /**
     * Make sure input is not null or empty
     */
    if (cleanOptionPrice != 0 && cleanOptionSymbol.length != 0
        && cleanAmtOfContracts != 0
        && cleanToken.length != 0 && cleanPassword.length != 0
        && cleanAmtOfContracts > 0) {
        axios_1.default.get("https://sandbox.tradier.com/v1/markets/quotes", {
            params: {
                'symbols': cleanOptionSymbol
            },
            headers: {
                'Authorization': 'Bearer ' + api.getToken(),
                'Accept': 'application/json'
            }
        }).then(function (response) { return __awaiter(void 0, void 0, void 0, function () {
            var optionPrice, purchaseResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        optionPrice = (+response.data.quotes.quote.last) * 100;
                        return [4 /*yield*/, Transactions.purchaseOption(cleanToken, cleanPassword, cleanOptionSymbol, optionPrice, cleanAmtOfContracts)];
                    case 1:
                        purchaseResponse = _a.sent();
                        if (purchaseResponse.http_id == 400 || purchaseResponse.http_id == 999)
                            res.status(purchaseResponse.http_id).json(purchaseResponse.message);
                        else {
                            res.json(purchaseResponse.message);
                        }
                        return [2 /*return*/];
                }
            });
        }); }).catch(function (err) {
            res.status(400).json("Error confirming option price");
        });
    }
    else {
        res.status(400).json("Inputs are invalid");
    }
});
/**
 * Gets a user's purchases of a specific stock
 * TODO: refactor to getAllPositionsOrOne
 */
router.route('/getSpecificPosition').get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cleanUserId, cleanStockSymbol, response_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cleanUserId = +xss(req.query.userId);
                //if it is not null, clean it, else set the input var as null
                req.query.stockSymbol != null ? cleanStockSymbol = xss(req.query.stockSymbol) : cleanStockSymbol = null;
                if (!(cleanUserId != 0 && cleanUserId != null)) return [3 /*break*/, 2];
                return [4 /*yield*/, Transactions.getUserPositionsSpecificStockOrAll(cleanUserId, cleanStockSymbol)];
            case 1:
                response_4 = _a.sent();
                if (response_4.http_id == 400 || response_4.http_id == 999)
                    res.status(response_4.http_id).json(response_4.message);
                else {
                    res.json(response_4);
                }
                return [3 /*break*/, 3];
            case 2:
                res.status(400).json("Inputs are invalid");
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Gets a user's purchases of a stock's options
  * TODO: refactor to getAllContractsOrOne

 */
router.route('/getSpecificOptionPosition').get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cleanUserId, cleanStockSymbol, response_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cleanUserId = +xss(req.query.userId);
                req.query.stockSymbol != null ? cleanStockSymbol = xss(req.query.stockSymbol) : cleanStockSymbol = null;
                if (!(cleanUserId != 0 && cleanUserId != null)) return [3 /*break*/, 2];
                return [4 /*yield*/, Transactions.getUserPositionsSpecificOptionOrAll(cleanUserId, cleanStockSymbol)];
            case 1:
                response_5 = _a.sent();
                if (response_5.http_id == 400 || response_5.http_id == 999)
                    res.status(response_5.http_id).json(response_5.message);
                else {
                    res.json(response_5);
                }
                return [3 /*break*/, 3];
            case 2:
                res.status(400).json("Inputs are invalid");
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
router.route('/getUserStockHistory').get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cleanUserId, cleanSalesOrPurchases, cleanFilterSymbol, response_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cleanUserId = (req.query.userId != undefined ? +req.query.userId : -1);
                cleanSalesOrPurchases = xss(req.query.salesOrPurchases);
                //If filter is sent in, set it to the cleaned version, else null
                (req.query.filter != null && req.query.filter != undefined && req.query.filter.length != 0)
                    ? cleanFilterSymbol = xss(req.query.filter) : cleanFilterSymbol = null;
                if (!(cleanUserId > 0 && cleanUserId != null && (cleanSalesOrPurchases == "sales" || cleanSalesOrPurchases == "purchases"))) return [3 /*break*/, 2];
                return [4 /*yield*/, Transactions.getAllUserStockTransactions(cleanUserId, cleanSalesOrPurchases, cleanFilterSymbol)];
            case 1:
                response_6 = _a.sent();
                if (response_6.http_id == 400 || response_6.http_id == 999) {
                    res.status(response_6.http_id).json(response_6.message);
                }
                else {
                    res.status(response_6.http_id).json(response_6.positions);
                }
                return [3 /*break*/, 3];
            case 2:
                res.status(400).json("Bad user input");
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
router.route('/getUserContractHistory').get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cleanUserId, cleanSalesOrPurchases, cleanFilterSymbol, response_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cleanUserId = (req.query.userId != undefined ? +req.query.userId : -1);
                cleanSalesOrPurchases = xss(req.query.salesOrPurchases);
                //If filter is sent in, set it to the cleaned version, else null
                (req.query.filter != null && req.query.filter != undefined && req.query.filter.length != 0)
                    ? cleanFilterSymbol = xss(req.query.filter) : cleanFilterSymbol = null;
                if (!(cleanUserId > 0 && cleanUserId != null && (cleanSalesOrPurchases == "sales" || cleanSalesOrPurchases == "purchases"))) return [3 /*break*/, 2];
                return [4 /*yield*/, Transactions.getAllUserContractTransactions(cleanUserId, cleanSalesOrPurchases, cleanFilterSymbol)];
            case 1:
                response_7 = _a.sent();
                if (response_7.http_id == 400 || response_7.http_id == 999) {
                    res.status(response_7.http_id).json(response_7.message);
                }
                else {
                    res.status(response_7.http_id).json(response_7.positions);
                }
                return [3 /*break*/, 3];
            case 2:
                res.status(400).json("Bad user input");
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * Sets a specific option to be expired
 */
router.route("/setOptionToExpired").post(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cleanUserId, cleanOptionSymbol, cleanOptionPurchaseId, response_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cleanUserId = +(xss(req.body.userId));
                cleanOptionSymbol = xss(req.body.optionSymbol);
                cleanOptionPurchaseId = +xss(req.body.optionPurchaseId);
                if (!(cleanOptionSymbol != null && cleanUserId != 0 && cleanUserId != null && cleanOptionSymbol.length != 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, Transactions.setOptionToExpired(cleanUserId, cleanOptionSymbol, cleanOptionPurchaseId)];
            case 1:
                response_8 = _a.sent();
                res.status(response_8.http_id).json(response_8.message);
                return [3 /*break*/, 3];
            case 2:
                res.status(400).json("Bad input");
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
