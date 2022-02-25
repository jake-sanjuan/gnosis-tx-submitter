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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTransaction = void 0;
const ethers_1 = require("ethers");
const safe_ethers_lib_1 = __importDefault(require("@gnosis.pm/safe-ethers-lib"));
const safe_core_sdk_1 = __importDefault(require("@gnosis.pm/safe-core-sdk"));
const safe_service_client_1 = __importDefault(require("@gnosis.pm/safe-service-client"));
const chalk_1 = __importDefault(require("chalk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function sendTransaction(safeAddress, transactionTargetAddresses, transactionValues, transactionData, chainId = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        let arrLength = transactionTargetAddresses.length;
        if (arrLength !== transactionData.length || arrLength !== transactionValues.length) {
            throw new Error("Mismatch array length");
        }
        const transactionArr = createTxArray(arrLength, transactionTargetAddresses, transactionValues, transactionData);
        console.log(`Transaction array totaling ${arrLength} transactions created`);
        let txUrl = getTxUrl(chainId);
        const signer = getSigner(chainId);
        const adapter = new safe_ethers_lib_1.default({
            ethers: ethers_1.ethers,
            signer: signer
        });
        const safe = yield safe_core_sdk_1.default.create({
            ethAdapter: adapter,
            safeAddress: safeAddress
        });
        const safeService = new safe_service_client_1.default(txUrl);
        const options = {
            nonce: yield safeService.getNextNonce(safeAddress)
        };
        console.log(chalk_1.default.magenta("Creating transaction..."));
        const tx = yield safe.createTransaction([...transactionArr], options);
        yield safe.signTransaction(tx);
        const txHash = yield safe.getTransactionHash(tx);
        try {
            yield safeService.proposeTransaction({
                safeAddress: safeAddress,
                safeTransaction: tx,
                safeTxHash: txHash,
                senderAddress: yield signer.getAddress(),
            });
            console.log(chalk_1.default.greenBright("Transaction sent!"));
        }
        catch (e) {
            console.log(chalk_1.default.redBright("Transaction failed! Stack trace:"));
            console.log(e);
        }
    });
}
exports.sendTransaction = sendTransaction;
const getSigner = (chainId) => {
    const provider = getProvider(chainId);
    return new ethers_1.ethers.Wallet(process.env.PRIVATE_KEY, provider);
};
const getProvider = (chainId) => {
    return new ethers_1.ethers.providers.AlchemyProvider(chainId, process.env.ALCHEMY_KEY);
};
const createTxArray = (arrLength, addresses, values, data) => {
    let transactionArr = [];
    if (arrLength === 1) {
        transactionArr.push({
            to: addresses[0],
            value: values[0],
            data: data[0]
        });
    }
    else {
        for (let i = 0; i < arrLength; i++) {
            transactionArr.push({
                to: addresses[i],
                value: values[i],
                data: data[i],
            });
        }
    }
    return transactionArr;
};
const getTxUrl = (chainId) => {
    let network;
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
    return `https://safe-transaction.${network}.gnosis.io`;
};
