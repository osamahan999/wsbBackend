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
var StockData = require('../src/StockData');
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
router.route('/searchBySymbol').get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var searchInput, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                searchInput = xss(req.query.input);
                return [4 /*yield*/, StockData.findBySymbol(searchInput)];
            case 1:
                response = _a.sent();
                res.status(response.http_id).json(response.stocks);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Gets a stock's quote by taking in the symbol for said stock
 * @param {string} stock
 * @return {JSON} quote
 */
router.route('/getStockQuote').get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stock, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                stock = xss(req.query.symbol);
                return [4 /*yield*/, StockData.getQuoteBySymbol(stock)];
            case 1:
                response = _a.sent();
                res.status(response.http_id).json(response.quotes);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Gets you all expiration dates
 * @param {string} symbol
 * @returns {array<string>} dates
 */
router.route('/getExpirations').get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stock, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                stock = xss(req.query.symbol);
                return [4 /*yield*/, StockData.getOptionExpirationsBySymbol(stock)];
            case 1:
                response = _a.sent();
                res.status(response.http_id).json(response.expirations);
                return [2 /*return*/];
        }
    });
}); });
/**
 * Gets option chains for a specific symbol with specific expiration for either call, put, or both
 *
 * @param {string} symbol
 * @param {string} expiration //ex : '2021-01-08'
 * @param {string} optionType //'call' for calls, 'put' for puts, 'all' for both
 *
 * @returns {array<JSON>} option chain
 */
router.route('/getOptionsOnDate').get(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stock, expiration, optionType, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                stock = xss(req.query.symbol);
                expiration = xss(req.query.expiration);
                optionType = xss(req.query.optionType);
                return [4 /*yield*/, StockData.getOptionsOnDate(stock, expiration, optionType)];
            case 1:
                response = _a.sent();
                res.status(response.http_id).json(response.options);
                return [2 /*return*/];
        }
    });
}); });
module.exports = router;
