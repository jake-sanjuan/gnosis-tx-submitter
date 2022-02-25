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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransaction = void 0;
var ethers_1 = require("ethers");
var safe_ethers_lib_1 = __importDefault(require("@gnosis.pm/safe-ethers-lib"));
var safe_core_sdk_1 = __importDefault(require("@gnosis.pm/safe-core-sdk"));
var safe_service_client_1 = __importDefault(require("@gnosis.pm/safe-service-client"));
var chalk_1 = __importDefault(require("chalk"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function sendTransaction(safeAddress, transactionTargetAddresses, transactionValues, transactionData, chainId) {
    if (chainId === void 0) { chainId = 1; }
    return __awaiter(this, void 0, void 0, function () {
        var arrLength, transactionArr, txUrl, signer, adapter, safe, safeService, options, tx, txHash, _a, _b, e_1;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    arrLength = transactionTargetAddresses.length;
                    if (arrLength !== transactionData.length || arrLength !== transactionValues.length) {
                        throw new Error("Mismatch array length");
                    }
                    transactionArr = createTxArray(arrLength, transactionTargetAddresses, transactionValues, transactionData);
                    console.log("Transaction array totaling ".concat(arrLength, " transactions created"));
                    txUrl = getTxUrl(chainId);
                    signer = getSigner(chainId);
                    adapter = new safe_ethers_lib_1.default({
                        ethers: ethers_1.ethers,
                        signer: signer
                    });
                    return [4 /*yield*/, safe_core_sdk_1.default.create({
                            ethAdapter: adapter,
                            safeAddress: safeAddress
                        })];
                case 1:
                    safe = _e.sent();
                    safeService = new safe_service_client_1.default(txUrl);
                    _c = {};
                    return [4 /*yield*/, safeService.getNextNonce(safeAddress)];
                case 2:
                    options = (_c.nonce = _e.sent(),
                        _c);
                    console.log(chalk_1.default.magenta("Creating transaction..."));
                    return [4 /*yield*/, safe.createTransaction(__spreadArray([], transactionArr, true), options)];
                case 3:
                    tx = _e.sent();
                    return [4 /*yield*/, safe.signTransaction(tx)];
                case 4:
                    _e.sent();
                    return [4 /*yield*/, safe.getTransactionHash(tx)];
                case 5:
                    txHash = _e.sent();
                    _e.label = 6;
                case 6:
                    _e.trys.push([6, 9, , 10]);
                    _b = (_a = safeService).proposeTransaction;
                    _d = {
                        safeAddress: safeAddress,
                        safeTransaction: tx,
                        safeTxHash: txHash
                    };
                    return [4 /*yield*/, signer.getAddress()];
                case 7: return [4 /*yield*/, _b.apply(_a, [(_d.senderAddress = _e.sent(),
                            _d)])];
                case 8:
                    _e.sent();
                    console.log(chalk_1.default.greenBright("Transaction sent!"));
                    return [3 /*break*/, 10];
                case 9:
                    e_1 = _e.sent();
                    console.log(chalk_1.default.redBright("Transaction failed! Stack trace:"));
                    console.log(e_1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.sendTransaction = sendTransaction;
var getSigner = function (chainId) {
    var provider = getProvider(chainId);
    return new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
};
var getProvider = function (chainId) {
    return new ethers_1.ethers.providers.AlchemyProvider(chainId, process.env.ALCHEMY_KEY);
};
var createTxArray = function (arrLength, addresses, values, data) {
    var transactionArr = [];
    if (arrLength === 1) {
        transactionArr.push({
            to: addresses[0],
            value: values[0],
            data: data[0]
        });
    }
    else {
        for (var i = 0; i < arrLength; i++) {
            transactionArr.push({
                to: addresses[i],
                value: values[i],
                data: data[i],
            });
        }
    }
    return transactionArr;
};
var getTxUrl = function (chainId) {
    var network;
    switch (chainId) {
        case 1:
            network = "mainnet";
            break;
        case 4:
            network = "rinkeby";
            break;
        case 5:
            network = "goerli";
            break;
        case 10:
            network = "optimism";
            break;
        case 137:
            network = "polygon";
            break;
        case 421611:
            network = "arbitrum";
            break;
        default:
            throw new Error("Chain ID does not exist");
    }
    return "https://safe-transaction.".concat(network, ".gnosis.io");
};
