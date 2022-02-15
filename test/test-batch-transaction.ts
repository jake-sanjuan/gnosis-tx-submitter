import {sendTransaction} from "../src/index";

/**
 * Has to be validated on Gnosis UI
 */

async function testBatchTransaction() {
    await sendTransaction(
        "0x52967DA31f243Eb9F35f151643Ab9D30e445B1C6",
        ["0x9e0bcE7ec474B481492610eB9dd5D69EB03718D5", "0x9e0bcE7ec474B481492610eB9dd5D69EB03718D5"],
        ["0", "0"],
        ["0xabcd", "0xbced"],
        5
    )
}

testBatchTransaction();