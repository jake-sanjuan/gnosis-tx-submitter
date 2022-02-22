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
 * Notes
 *  Probably want to figure out how to make script able to determine which network to put in URL
 *      Enum with corresponding networks that can be inserted into URL
 *  Create package 
 */

const NETWORKS = {
    1: "mainnet",
    4: "rinkeby",
    5: "goerli",
    10: "optimism",
    137: "polygon",
    421611: "arbitrum",
}

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

const getSigner = (chainId: number): Signer => {
    const provider = getProvider(chainId);
    return new ethers.Wallet(process.env.PRIVATE_KEY!, provider) as Signer;
}

const getProvider = (chainId: number): ethers.providers.AlchemyProvider =>  {
    return new ethers.providers.AlchemyProvider(chainId, process.env.ALCHEMY_KEY)
}

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
            network = "optimisim";
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