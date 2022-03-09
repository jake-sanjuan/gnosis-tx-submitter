import {ethers} from "ethers";
import type {Signer} from "ethers";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import Safe, {SafeTransactionOptionalProps} from "@gnosis.pm/safe-core-sdk";
import { 
    SafeTransactionDataPartial, 
    MetaTransactionData,
} from "@gnosis.pm/safe-core-sdk-types"
import SafeServiceClient from "@gnosis.pm/safe-service-client";
import chalk from "chalk";
import dotenv from "dotenv";

dotenv.config();

/**
 * This asynchronous function will send transactions to the supplied Gnosis Safe address to be signed by the safe owners
 * 
 * @param {string} safeAddress - Address of the safe that transactions will be sent to
 * @param {string[]} transactionTargetAddresses - An array of the addresses that safe transactions will interact with
 * @param {string[]}transactionValues - An array of corresponding values that will be sent with transactions
 * @param {string[]} transactionData - An array of bytecode data to be sent with the transactions when interacting with smart contracts
 * @param {number} [chainId=1] - An optional chaind Id parameter corresponding with the chain the Gnosis Safe is on
 * @return {Promise<void>} - No return value
 */
export async function sendTransaction(
    safeAddress: string,
    transactionTargetAddresses: string[],
    transactionValues: string[],
    transactionData: string[],
    chainId: number = 1
): Promise<void> {

    let arrLength: number = transactionTargetAddresses.length;
    if(arrLength !== transactionData.length || arrLength !== transactionValues.length) { 
        throw new Error("Mismatch array length"); 
    }

    const transactionArr = createTxArray(
        arrLength,
        transactionTargetAddresses,
        transactionValues,
        transactionData
    );
    console.log(`Transaction array totaling ${arrLength} transactions created`);

    let txUrl = getTxUrl(chainId);
    const signer = getSigner(chainId);
    const adapter = new EthersAdapter({
        ethers: ethers,
        signer: signer
    });
    const safe:Safe = await Safe.create({
        ethAdapter: adapter,
        safeAddress: safeAddress
    });

    const safeService  = new SafeServiceClient(txUrl);
    const options: SafeTransactionOptionalProps = {
        nonce: await safeService.getNextNonce(safeAddress)
    }

    console.log(chalk.magenta("Creating transaction..."));
    const tx = await safe.createTransaction([...transactionArr], options);
    await safe.signTransaction(tx);
    const txHash = await safe.getTransactionHash(tx);

    try {
        await safeService.proposeTransaction({
            safeAddress:safeAddress,
            safeTransaction: tx,
            safeTxHash: txHash,
            senderAddress: await signer.getAddress(),
        });
        console.log(chalk.greenBright("Transaction sent!"))
    } catch (e) {
        console.log(chalk.redBright("Transaction failed! Stack trace:"))
        console.log(e)
    }
}

/**
 * A function that returns a new ethers.js Signer with the users private key
 * 
 * @param {number} chainId - The chain Id corresponsing with the chain the Gnosis Safe is on
 * @return {Signer} - Returns an ethers.js Signer type
 */
const getSigner = (chainId: number): Signer => {
    const provider = getProvider(chainId);
    return new ethers.Wallet(process.env.PRIVATE_KEY!, provider) as Signer;
}

/**
 * A function that returns an ethers.js Alchemy provider
 * 
 * @param {number} chainId - The chain Id corresponding with the chain the Gnosis Safe is on
 * @returns {ethers.providers.AlchemyProvider} An ethers.js provider type connected to Alchemy
 */
const getProvider = (chainId: number): ethers.providers.AlchemyProvider =>  {
    return new ethers.providers.AlchemyProvider(chainId, process.env.ALCHEMY_KEY)
}

/**
 * A function that creates and returns the formatted data to be passed to the Gnosis Safe
 * 
 * @param {number} arrLength - The length of the arrays
 * @param {string[]} addresses - An array with all of the addresses to be interacted with
 * @param {string[]} values - An array containing the values for each corresponding transaction
 * @param {string[]} data - An array containing the data for the corresponding transactions
 * @returns {SafeTransactionDataPartial[] | MetaTransactionData[]} - Array of objects dependent on length of data
 */
const createTxArray = (
    arrLength: number,
    addresses: string[],
    values: string[],
    data: string[]
): SafeTransactionDataPartial[] | MetaTransactionData[] => {
    let transactionArr: SafeTransactionDataPartial[] | MetaTransactionData[] = [];
    if(arrLength === 1) {
        transactionArr.push({
            to: addresses[0],
            value: values[0],
            data: data[0]
        } as SafeTransactionDataPartial);
    } else {
        for (let i = 0; i < arrLength; i++) {
            transactionArr.push({
                to: addresses[i],
                value: values[i],
                data: data[i],
            } as MetaTransactionData);
        }
    }
    return transactionArr;
}

/**
 * Function that formats the url that will be used to post transaction to Gnosis
 * 
 * @param {number} chainId - ChainId corresponding with the chain the Gnosis Safe is deployed on
 * @returns {string} - Url that will be used to post transaction to Gnosis
 */
const getTxUrl = (chainId: number): string => {

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
    return `https://safe-transaction.${network}.gnosis.io`
}