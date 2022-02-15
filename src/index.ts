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
    transactionTargetAddresses: string[],
    transactionValues: string[],
    transactionData: string[],
    chainId: number = 1
): Promise<void> {

    let arrLength: number = transactionTargetAddresses.length;
    if(
        arrLength !== transactionData.length || 
        arrLength !== transactionValues.length
    ) { 
        throw new Error("Mismatch array length"); 
    }

    const transactionArr = createTxArray(
        arrLength,
        transactionTargetAddresses,
        transactionValues,
        transactionData
    );
    await createAndSendSafeTx(
        chainId,
        safeAddress,
        transactionArr
    );
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

// Call to other function to figure out URL
const createAndSendSafeTx = async (
    chainId: number,
    safeAddress: string,
    transactionArr: SafeTransactionDataPartial[] | MetaTransactionData[],
): Promise<void> => {
    const signer = getSigner(chainId);
    const adapter: EthersAdapter = createAdapter(signer);
    const safe:Safe = await Safe.create({
        ethAdapter: adapter,
        safeAddress: safeAddress
    });

    const safeService  = new SafeServiceClient(TX_URL);
    const options: SafeTransactionOptionalProps = {
        nonce: await safeService.getNextNonce(safeAddress)
    }

    const tx = await safe.createTransaction([...transactionArr], options);
    await safe.signTransaction(tx);
    const txHash = await safe.getTransactionHash(tx);
    await safeService.proposeTransaction({
        safeAddress:safeAddress,
        safeTransaction: tx,
        safeTxHash: txHash,
        senderAddress: await signer.getAddress(),
    });
}

const createAdapter = (signer: Signer): EthersAdapter => {
    return new EthersAdapter({
        ethers: ethers,
        signer: signer
    });
}