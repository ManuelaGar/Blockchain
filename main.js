//jshint esversion:6
// Example taken from https://www.youtube.com/watch?v=zVqczFZr124

const SHA256 = require("crypto-js/SHA256");

class Transaction{
  constructor(fromAddress, toAddress, amount){
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }
}

class Block{
  constructor(timestamp, transactions, previousHash = ''){
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  calculateHash() {
    return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
  }

  mineBlock(difficulty) {
    //Loop that keeps running until the hash has enough ceros
    while(this.hash.substring(0, difficulty) !== Array(difficulty+1).join("0")) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log("Block mined " + this.hash);
  }
}

class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  createGenesisBlock() {
    return new Block("01/01/2019", "Genesis Block", "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    let block = new Block(Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);

    console.log("Block successfully mined");
    this.chain.push(block);
    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward)
    ];
  }

  createTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  // There is no such a thing as a balance in Blockchain, so to calculate
  // your balance you have to loop though all the blocks and find the Transactions
  // made by you, substracting or adding the amounts depending if you were the
  // sender or the receiver of the transaction.

  getBalanceOfAddress(address) {
    let balance = 0;
    for(const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }
    return balance;
  }

  isChainValid() {
    // First loop starts in 1 because 0 is the genesis block

    for(let i=1; i< this.chain.length; i++){
      var currentBlock = this.chain[i];
      var previousBlock = this.chain[i-1];

      //Check if the two blocks are properly linked together

      //1. Check if the hash of the block is still valid
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      //2. Check if the block points to a correct previous block
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }

    }
    //If everything was okay return true
    return true;
  }
}

let manuCoin = new Blockchain();

manuCoin.createTransaction(new Transaction('address 1', 'address 2', 100));
manuCoin.createTransaction(new Transaction('address 2', 'address 1', 50));

console.log("\nStarting the miner...");
manuCoin.minePendingTransactions("manu-address");

console.log("\nBalance of Manu is", manuCoin.getBalanceOfAddress("manu-address"));

console.log("\nStarting the miner again...");
manuCoin.minePendingTransactions("manu-address");

console.log("\nBalance for Manu is", manuCoin.getBalanceOfAddress("manu-address"));
