import {ethers} from "ethers";
import type {Signer} from "ethers";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import Safe, {SafeTransactionOptionalProps} from "@gnosis.pm/safe-core-sdk";
import { 
    SafeTransactionDataPartial, 
    MetaTransactionData,
} from "@gnosis.pm/safe-core-sdk-types"
import SafeServiceClient from "@gnosis.pm/safe-service-client";
import dotenv from "dotenv";

dotenv.config();

/**
 * Notes
 *  Add console logs
 *  Probably want to figure out how to make script able to determine which network to put in URL
 *      Enum? 
 */

const TX_URL = "https://safe-transaction.goerli.gnosis.io";

export async function sendTransaction(
    safeAddress: string,
    transactionTargetAddress: string,
    transactionValue: string,
    transactionData: string,
    chainId: number = 1, // Default mainnet 
): Promise<void> {

    const safeService = new SafeServiceClient(TX_URL);
    const signer = getSigner(chainId)
    const transaction: SafeTransactionDataPartial = {
        to: transactionTargetAddress,
        value: transactionValue,
        data: transactionData,
        nonce: await safeService.getNextNonce(safeAddress)
    }
    const adapter = new EthersAdapter({
        ethers: ethers, 
        signer: signer
    });
    const safe: Safe = await Safe.create({
        ethAdapter: adapter,
        safeAddress: safeAddress
    });
    const tx = await safe.createTransaction(transaction);
    await safe.signTransaction(tx);
    const txHash = await safe.getTransactionHash(tx);

    safeService.proposeTransaction({
        safeAddress: safeAddress,
        safeTransaction: tx,
        safeTxHash: txHash,
        senderAddress: await signer.getAddress()
    });
}

export async function sendBatchTransaction(
    safeAddress: string,
    transactionTargetAddresses: string[],
    transactionValues: string[],
    transactionData: string[],
    chainId: number = 1
): Promise<void> {

    if(
        transactionTargetAddresses.length != transactionData.length || 
        transactionTargetAddresses.length != transactionValues.length
    ) {
        throw new Error("Mismatch array length");
    }

    const safeService  = new SafeServiceClient(TX_URL);
    const signer = getSigner(chainId);
    
    const transactions: MetaTransactionData[] = [];
    for (let i = 0; i < transactionTargetAddresses.length; i++) {
        transactions.push({
            to: transactionTargetAddresses[i],
            value: transactionValues[i],
            data: transactionData[i],
        } as MetaTransactionData);
    }
    const adapter:EthersAdapter = new EthersAdapter({
        ethers: ethers,
        signer: signer
    });
    const safe:Safe = await Safe.create({
        ethAdapter: adapter,
        safeAddress: safeAddress
    });

    const options: SafeTransactionOptionalProps = {
        nonce: await safeService.getNextNonce(safeAddress)
    }

    const tx = await safe.createTransaction([...transactions], options);
    await safe.signTransaction(tx);
    const txHash = await safe.getTransactionHash(tx);

    console.log(transactions)
    console.log(tx)

    await safeService.proposeTransaction({
        safeAddress:safeAddress,
        safeTransaction: tx,
        safeTxHash: txHash,
        senderAddress: await signer.getAddress(),
    });
}

const getSigner = (chainId: number): Signer => {
    const provider = getProvider(chainId);
    return new ethers.Wallet(process.env.PRIVATE_KEY!, provider) as Signer;
}

const getProvider = (chainId: number): ethers.providers.AlchemyProvider =>  {
    return new ethers.providers.AlchemyProvider(chainId, process.env.ALCHEMY_KEY)
}