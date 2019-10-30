//jshint esversion:6

// Blockchain example with Proof-of-work, transactions and mining rewards
// Example taken from https://www.youtube.com/watch?v=zVqczFZr124

const {Blockchain, Transaction} = require("./blockchain");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

let manuCoin = new Blockchain();

// My private key
const myKey = ec.keyFromPrivate("fc764c5b7a50be04526a1c3b2ffb923c9a34e90bae655310eb126c8cfb3123a2");
// From that, calculate my public key which is also my wallet address
const myWalletAddress = myKey.getPublic("hex");

//Create a transaction and sign it with my key
const tx1 = new Transaction(myWalletAddress, "address 2", 10);
tx1.signTransaction(myKey);
manuCoin.addTransaction(tx1);

//Mine block
manuCoin.minePendingTransactions(myWalletAddress);

console.log("\nBalance of Manu is", manuCoin.getBalanceOfAddress(myWalletAddress));

console.log("Blockchain valid? ", manuCoin.isChainValid() ? "Yes" : "No");
