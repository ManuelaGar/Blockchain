//jshint esversion:6

//Import library that generates a public and private key
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

const key = ec.genKeyPair();
const publicKey = key.getPublic("hex");
const privateKey = key.getPrivate("hex");

console.log("PrivateKey: ", privateKey);
console.log("PublicKey: ", publicKey);

// PrivateKey:  fc764c5b7a50be04526a1c3b2ffb923c9a34e90bae655310eb126c8cfb3123a2
// PublicKey:  0416150cdf8c7b55a1c11b934fe29835502819a0524443b05a84741a730780602bbad2fb56d4e84f08717537e1ac5a07d371707b165ded6397513ea74207fefdfa
