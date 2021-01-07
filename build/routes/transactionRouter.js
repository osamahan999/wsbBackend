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
Object.defineProperty(exports, "__esModule", { value: true });
var router = require('express').Router();
var xss = require('xss'); //used for cleaning user input
var Transactions = require('../src/Transactions');
/**
 * User calls this with their login token to make a purchase.
 *
 * I assume this is extremely insecure but I'm not sure how real payment systems handle this. Do you ask them for their password each time?
 *
 * TODO: get cost of stock from API to make sure they paying right amt. Can do this, but this doubles my api calls so not doing it
 */
router.route('/purchaseStock').post(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cleanToken, cleanPassword, cleanStockSymbol, cleanStockName, cleanStockPrice, cleanAmtOfStocks, cleanExchange, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cleanToken = xss(req.body.token);
                cleanPassword = xss(req.body.password);
                cleanStockSymbol = xss(req.body.stockSymbol);
                cleanStockName = xss(req.body.stockName);
                cleanStockPrice = +xss(req.body.stockPrice);
                cleanAmtOfStocks = +xss(req.body.amtOfStocks);
                cleanExchange = xss(req.body.exchange);
                if (!(cleanStockPrice != 0 && cleanStockName.length != 0
                    && cleanAmtOfStocks != 0 && cleanExchange.length != 0
                    && cleanToken.length != 0 && cleanPassword.length != 0
                    && cleanAmtOfStocks > 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, Transactions.purchaseStock(cleanToken, cleanPassword, cleanStockSymbol, cleanStockName, cleanStockPrice, cleanAmtOfStocks, cleanExchange)];
            case 1:
                response = _a.sent();
                if (response.http_id == 400 || response.http_id == 999)
                    res.status(response.http_id).json(response.message);
                else {
                    res.json(response.message);
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
 * User calls this with their login token to make a purchase of an option.
 *
 *
 * TODO: get cost of option from API to make sure they paying right amt. Can do this, but this doubles my api calls so not doing it
 */
router.route('/purchaseOption').post(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cleanToken, cleanPassword, cleanOptionSymbol, cleanOptionPrice, cleanAmtOfContracts, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cleanToken = xss(req.body.token);
                cleanPassword = xss(req.body.password);
                cleanOptionSymbol = xss(req.body.optionSymbol);
                cleanOptionPrice = +xss(req.body.optionPrice);
                cleanAmtOfContracts = +xss(req.body.amtOfContracts);
                if (!(cleanOptionPrice != 0 && cleanOptionSymbol.length != 0
                    && cleanAmtOfContracts != 0
                    && cleanToken.length != 0 && cleanPassword.length != 0
                    && cleanAmtOfContracts > 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, Transactions.purchaseOption(cleanToken, cleanPassword, cleanOptionSymbol, cleanOptionPrice, cleanAmtOfContracts)];
            case 1:
                response = _a.sent();
                if (response.http_id == 400 || response.http_id == 999)
                    res.status(response.http_id).json(response.message);
                else {
                    res.json(response.message);
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
 * Gets a user's purchases of a specific stock
 */
router.route('/getSpecificPosition').get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cleanUserId, cleanStockSymbol, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cleanUserId = +xss(req.query.userId);
                cleanStockSymbol = xss(req.query.stockSymbol);
                if (!(cleanUserId != 0 && cleanUserId != null && cleanStockSymbol.length > 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, Transactions.getUserPositionsSpecificStock(cleanUserId, cleanStockSymbol)];
            case 1:
                response = _a.sent();
                if (response.http_id == 400 || response.http_id == 999)
                    res.status(response.http_id).json(response.message);
                else {
                    res.json(response);
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
 */
router.route('/getSpecificOptionPosition').get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var cleanUserId, cleanStockSymbol, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                cleanUserId = +xss(req.query.userId);
                cleanStockSymbol = xss(req.query.stockSymbol);
                if (!(cleanUserId != 0 && cleanUserId != null && cleanStockSymbol.length > 0)) return [3 /*break*/, 2];
                return [4 /*yield*/, Transactions.getUserPositionsSpecificOption(cleanUserId, cleanStockSymbol)];
            case 1:
                response = _a.sent();
                if (response.http_id == 400 || response.http_id == 999)
                    res.status(response.http_id).json(response.message);
                else {
                    res.json(response);
                }
                return [3 /*break*/, 3];
            case 2:
                res.status(400).json("Inputs are invalid");
                _a.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
module.exports = router;
