# Gnosis Transaction Submitter

Used to submit transactions via scripts to the Gnosis UI.

### Installation

```npm i gnosis-tx-submitter```

OR 

```yarn add gnosis-tx-submitter```

### Usage

In a `.env` file, add an `ALCHEMY_KEY` and a `PRIVATE_KEY`.  If you do not have an API key for Alchemy, you can get one at https://www.alchemy.com/.  The private key must be a signer on the safe that you plan on sending the transaction to.

```
PRIVATE_KEY=...
ALCHEMY_KEY=...
```

To start using the transaction submitter, import `sendTransaction()` into your script

```typescript
import { sendTransaction } from "gnosis-tx-submitter"
```

In order to actually submit a transaction, a safe address, an array of target addresses, an array of values, an array of transaction data, and a chainId must be passed into the `sendTransaction()` function.  The values will be value in Ether, and can be set to 0 if no Ether is being sent

```typescript
const safeAddress = "0xabc...";
const targetAddressArray = ["0xcba", "0xecd"];
const valueArray = ["0", "1.25"];
const transactionDataArray = ["0x1234", "0x4321"];
const chainId = 1 // Mainnet

await sendTransaction(
    safeAddress,
    targetAddressArray,
    valueArray,
    transactionDataArray,
    chainId
)
```

The transaction submitter currently supports mainnet, rinkeby, goerli, optimism, polygon and arbutrum chains.



