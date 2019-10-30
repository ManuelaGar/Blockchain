//jshint esversion:6

const SHA256 = require("crypto-js/SHA256");

const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

class Transaction{
  constructor(fromAddress, toAddress, amount){
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString();
  }

  signTransaction(signingKey) {
    //Check if your public key equals the from addres
    if(signingKey.getPublic("hex") !== this.fromAddress) {
      throw new Error("You cannot sign transactions for other wallets");
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx,"base64");
    this.signature = sig.toDER("hex");

  }

  //Method to verify if the transaction was correctly signed
  isValid() {
    //Asume transaction as valid if the from addres is null - For mining rewards
    if (this.fromAddress === null) return true;

    //If there is no signature or if it is empty throw an error
    if (!this.signature || this.signature.length === 0) {
      throw new Error("No signature in this transaction");
    }

    //Verify if the transaction was signed with the correct key
    const publicKey = ec.keyFromPublic(this.fromAddress,"hex");
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

class Block{
  constructor(timestamp, transactions, previousHash = ""){
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

  hasValidTransactions(){
    for(const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }

    return true;
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
    return new Block("01/01/2019", [], "0");
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(miningRewardAddress) {
    const rewardTx = new Transaction(null, miningRewardAddress, this.miningReward);
    this.pendingTransactions.push(rewardTx);

    let block = new Block(Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);

    console.log("Block successfully mined");
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward)
    ];
  }

  addTransaction(transaction) {
    //Check that the transactions has a to and from address
    if (!transaction.toAddress || !transaction.fromAddress) {
      throw new Error("Transaction must include a to and from address");
    }

    //Verify that the transaction is valid
    if (!transaction.isValid()) {
      throw new Error("Cannot add invalid transaction to chain");
    }

    //Check if the transaction amount is greater than 0
    if (transaction.amount <= 0) {
      throw new Error("Transaction amount should be higher than 0");
    }

    //Check that the amount sent is not greater than existing Balance
    // if (this.getBalanceOfAddress(transaction.fromAddress) < transaction.amount) {
    //   throw new Error("Not enough balance");
    // }

    this.pendingTransactions.push(transaction);
    console.log("Transaction added: ", transaction);
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

  getAllTransactionsForWallet(address) {
    const txs = [];

    for(const block of this.chain) {
      for (const trans of block.transactions) {
        if (tx.fromAddress === address || tx.toAddress === address) {
          txs.push(tx);
        }
      }
    }

    console.log("Get transactions for wallet count: ", txs.length);
    return txs;
  }

  // Method to verify that the hashes are correct and that each block links to
  // the previous block
  isChainValid() {

    // Chech if the genesis block hasn't been modified by comparing
    // the output of createGenesisBlock with the first block on our chain
    const realGenesis = JSON.stringify(this.createGenesisBlock());
    if (realGenesis !== JSON.stringify(this.chain[0])) {
      return false;
    }

    // First loop starts in 1 because 0 is the genesis block
    for(let i=1; i< this.chain.length; i++){
      var currentBlock = this.chain[i];
      var previousBlock = this.chain[i-1];

      // Check that in the current block all transactions are valid
      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      //Check if the two blocks are properly linked together by
      //checking if the hash of the block is still valid
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }
    }
    //If everything was okay return true
    return true;
  }
}

module.exports.Blockchain = Blockchain;
module.exports.Block = Block;
module.exports.Transaction = Transaction;
