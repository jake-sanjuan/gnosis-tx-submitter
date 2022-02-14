import {ethers} from "ethers";
import type {Signer} from "ethers";
import EthersAdapter from "@gnosis.pm/safe-ethers-lib";
import Safe from "@gnosis.pm/safe-core-sdk";
import { SafeTransactionDataPartial, SafeTransaction } from "@gnosis.pm/safe-core-sdk-types"
import SafeServiceClient from "@gnosis.pm/safe-service-client";
import dotenv from "dotenv";

dotenv.config();

/**
 * Notes
 *  Might want to take a private key in
 *  Probably want to figure out how to make script able to determine which network to put in URL
 *  Might want to turn this into a class, move constant into class
 *  Need nonce for multisend, should use for regular tx as well
 *    safeService.getNextNonce(safeAddress)
 */

const TX_URL = "https://safe-transaction.goerli.gnosis.io";

export default async function sendTransaction(
    safeAddress: string,
    transactionTargetAddress: string,
    transactionValue: string,
    transactionData: string,
    chainId: number = 1, // Default mainnet 
): Promise<void> {


    const safeService = new SafeServiceClient(TX_URL);

    const provider = getProvider(chainId);  
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider) as Signer;
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

const getProvider = (chainId: number): ethers.providers.AlchemyProvider =>  {
    return new ethers.providers.AlchemyProvider(chainId, process.env.ALCHEMY_KEY)
}

const submitTx = async (safeAddress: string, safeTx: SafeTransaction): Promise<void> => {
    
}