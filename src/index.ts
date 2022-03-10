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

/**
 * @typedef {Object} Transaction - Defines a single transaction to be submitted to the Gnosis Safe
 * @property {string} transactionTargetAddress - Ethereum address that transaction will interact with
 * @property {ethers.BigNumber} transactionValue - The Ether value that corresponds with this transaction
 * @property {string} transactionData - The data that corresponds with this transaction
 */
export type Transaction = {
  transactionTargetAddress: string;
  transactionValue: ethers.BigNumber;
  transactionData: string;
}

/**
 * This asynchronous function will send transactions to the supplied Gnosis Safe address to be signed by the safe owners
 * 
 * @param {string} safeAddress - Address of the safe that transactions will be sent to
 * @param {Transaction[]} transactions - Array of transaction objects
 * @param {number} [chainId=1] - An optional chaind Id parameter corresponding with the chain the Gnosis Safe is on
 * @param {string} privateKey - Private key for Ethereum address. Must be for signer on Gnosis safe safeAddress 
 * @param {string} alchemyKey - Alchemy api key
 * @return {Promise<void>} - No return value
 */
export async function sendTransaction(
    safeAddress: string,
    transactions: Transaction[],
    privateKey: string,
    alchemyKey: string,
    chainId: number = 1
): Promise<void> {

    const transactionArr = createTxArray(
        transactions
    );
    console.log(`Transaction array totaling ${transactionArr.length} transactions created`);

    let txUrl = getTxUrl(chainId);
    const provider = getProvider(chainId);
    const signer = getSigner(privateKey, provider);
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
 * @param {string} privateKey - Private key for Ethereum address. Must be for signer on Gnosis safe safeAddress 
 * @param {ethers.providers.AlchemyProvider} - ethers.js Alchemy provider
 * @return {Signer} - Returns an ethers.js Signer type
 */
const getSigner = (privateKey: string, provider: ethers.providers.AlchemyProvider): Signer => {
    return new ethers.Wallet(privateKey, provider) as Signer;
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
 * @param {Transaction[]} transactions - Array of Transaction objects
 * @returns {SafeTransactionDataPartial[] | MetaTransactionData[]} - Array of objects dependent on length of data
 */
const createTxArray = (
    transactions: Transaction[]
): SafeTransactionDataPartial[] | MetaTransactionData[] => {
    let transactionArr: SafeTransactionDataPartial[] | MetaTransactionData[] = [];
    let arrLength = transactions.length;
    if(arrLength === 1) {
        transactionArr.push({
            to: transactions[0].transactionTargetAddress,
            value: transactions[0].transactionValue.toString(),
            data: transactions[0].transactionData
        } as SafeTransactionDataPartial);
    } else {
        for (let i = 0; i < arrLength; i++) {
            transactionArr.push({
              to: transactions[i].transactionTargetAddress,
              value: transactions[i].transactionValue.toString(),
              data: transactions[i].transactionData
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