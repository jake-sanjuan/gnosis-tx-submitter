# Gnosis Transaction Submitter

Used to submit transactions via scripts to the Gnosis UI.

### Installation

```npm i gnosis-tx-submitter```

OR 

```yarn add gnosis-tx-submitter```

### Usage

To start using the transaction submitter, import `sendTransaction()` and `Transaction` into your script

```typescript
import { sendTransaction, Transaction } from "gnosis-tx-submitter";
```

In order to actually submit a transaction, a safe address, an array of `Transaction` objects, a private key, an Alchemy key, and a chainId must be passed into the `sendTransaction()` function.  The values will be value in Ether, and can be set to 0 if no Ether is being sent.

```typescript
const tx: Transaction[] = [
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

const safeAddress = "0xabc...";
const privateKey = "1ab...";
const alchemyKey = "V1m...";
const chainId = 1

await sendTransaction(
    safeAddress,
    tx,
    privateKey,
    alchemyKey,
    chainId
)
```

The transaction submitter currently supports mainnet, rinkeby, goerli, optimism, polygon and arbitrum chains.



