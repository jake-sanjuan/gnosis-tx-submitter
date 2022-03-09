import {sendTransaction, Transaction} from "../src/index";
import {ethers} from "ethers";

const zero = ethers.BigNumber.from(0);

/**
 * Has to be validated on Gnosis UI
 */
let tx: Transaction[] = [
   {
    transactionTargetAddress: "0x9e0bcE7ec474B481492610eB9dd5D69EB03718D5",
    transactionValue: zero,
    transactionData: "0xab"
   },
   {
    transactionTargetAddress: "0x9e0bcE7ec474B481492610eB9dd5D69EB03718D5",
    transactionValue: zero,
    transactionData: "0xbc"
   }
];

async function testBatchTransaction() {
    await sendTransaction(
        "0x52967DA31f243Eb9F35f151643Ab9D30e445B1C6",
        tx,
        5
    )
}

testBatchTransaction();