import sendTransaction from "../src/index";

/**
 * Has to be validated on Gnosis frontend interface
 */

async function testSingleTransaction() {
    await sendTransaction(
        "0x52967DA31f243Eb9F35f151643Ab9D30e445B1C6",
        "0x3d146A937Ddada8AfA2536367832128F3F967E29",
        "0",
        "0xabcd",
        5
    );
}

testSingleTransaction();