/**
 *                          Blockchain Class
 *  The Blockchain class contain the basics functions to create your own private blockchain
 *  It uses libraries like `crypto-js` to create the hashes for each block and `bitcoinjs-message`
 *  to verify a message signature. The chain is stored in the array
 *  `this.chain = [];`. Of course each time you run the application the chain will be empty because and array
 *  isn't a persisten storage method.
 *
 */

const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./block.js');
const bitcoinMessage = require('bitcoinjs-message');
const hex2ascii = require('hex2ascii');

class Blockchain {

    /**
     * Constructor of the class, you will need to setup your chain array and the height
     * of your chain (the length of your chain array).
     * Also everytime you create a Blockchain class you will need to initialized the chain creating
     * the Genesis Block.
     * The methods in this class will always return a Promise to allow client applications or
     * other backends to call asynchronous functions.
     */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }

    /**
     * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
     * You should use the `addBlock(block)` to create the Genesis Block
     * Passing as a data `{data: 'Genesis Block'}`
     */
    async initializeChain() {
        if( this.height === -1){
            let block = new BlockClass.Block({data: 'Genesis Block'});
            await this._addBlock(block);
        }
    }

    /**
     * Utility method that return a Promise that will resolve with the height of the chain
     */
    getChainHeight() {
        return new Promise((resolve, reject) => {
            resolve(this.height);
        });
    }

    /**
     * _addBlock(block) will store a block in the chain
     * @param {*} block
     * The method will return a Promise that will resolve with the block added
     * or reject if an error happen during the execution.
     * You will need to check for the height to assign the `previousBlockHash`,
     * assign the `timestamp` and the correct `height`...At the end you need to
     * create the `block hash` and push the block into the chain array. Don't for get
     * to update the `this.height`
     * Note: the symbol `_` in the method name indicates in the javascript convention
     * that this method is a private method.
     */
    _addBlock(block) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            block.height = this.chain.length;
            //block.height = await self.getChainHeight()
            if (block.height !== 0 ) {
                block.previousBlockHash = this.chain[block.height-1].hash;
            }

            block.time = new Date().getTime().toString().slice(0,-3);
            block.hash = await SHA256(JSON.stringify(block)).toString();

            if ( block.time && block.hash ) {
                this.height = block.height + 1;
                this.chain.push(block);
                resolve(block);
            }

            reject(new Error('invalid block.'));
        });
    }

    /**
     * The requestMessageOwnershipVerification(address) method
     * will allow you  to request a message that you will use to
     * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
     * This is the first step before submit your Block.
     * The method return a Promise that will resolve with the message to be signed
     * @param {*} address
     */
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            resolve( `${address}:${new Date().getTime().toString().slice(0,-3)}:starRegistry`)
        });
    }

    /**
     * The submitStar(address, message, signature, star) method
     * will allow users to register a new Block with the star object
     * into the chain. This method will resolve with the Block added or
     * reject with an error.
     * Algorithm steps:
     * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
     * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
     * 3. Check if the time elapsed is less than 5 minutes
     * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
     * 5. Create the block and add it to the chain
     * 6. Resolve with the block added.
     * @param {*} address
     * @param {*} message
     * @param {*} signature
     * @param {*} star
     */
    submitStar(address, message, signature, star) {

        let self = this;
        return new Promise(async (resolve, reject) => {

            if (!bitcoinMessage.verify(message, address, signature,null,true)) reject(new Error('Invalid message.'));

            let _reqt = parseInt(message.split(':')[1]);
            let _ct = parseInt(new Date().getTime().toString().slice(0, -3));
            // reject on error
            if ((_ct - _reqt) >= (5 * 60)) reject(new Error('Stale Request.'));
            // add block to chain & resolve
            let block = new BlockClass.Block({ star });
            block.owner = address;
            block = self._addBlock(block)
            resolve(block);
        });

    }

    /**
     * This method will return a Promise that will resolve with the Block
     *  with the hash passed as a parameter.
     * Search on the chain array for the block that has the hash.
     * @param {*} hash
     */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve, reject) => {
            resolve(self.chain.filter(block => block.hash === hash)[0]);
        });
    }

    /**
     * This method will return a Promise that will resolve with the Block object
     * with the height equal to the parameter `height`
     * @param {*} height
     */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve, reject) => {
            let block = self.chain.filter(p => p.height === height)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }

    /**
     * This method will return a Promise that will resolve with an array of Stars objects existing in the chain
     * and are belongs to the owner with the wallet address passed as parameter.
     * Remember the star should be returned decoded.
     * @param {*} address
     */
    getStarsByWalletAddress (address) {
        let self = this;
        let stars = [];
        
        return new Promise((resolve, reject) => {
            let _addOwned = self.chain.filter(block => block.owner === address);
            if (_addOwned.length === 0) resolve(stars);
            stars = _addOwned.map(block => JSON.parse(hex2ascii(block.body)));
            stars ? resolve(stars) : reject(new Error('Invalid Star Info.'));
        });
    }

    /**
     * This method will return a Promise that will resolve with the list of errors when validating the chain.
     * Steps to validate:
     * 1. You should validate each block using `validateBlock`
     * 2. Each Block should check the with the previousBlockHash
     */
    validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {
            for( let i=0;i<self.chain.length;i++) {
                let _b = self.chain[i];
                if (await _b.validate()) {
                    if (_b.height>0) {
                        let _prev = this.chain[_b.height-1];
                        if(_prev.hash !== _b.previousBlockHash) errorLog.push(new Error(`Error : Block #${_b.height} - hash mismatch.`));

                    }
                } else {
                    errorLog.push(new Error(`Error #${_b.height}: ${_b.hash}`))
                }

            }
            errorLog.length > 0 ? resolve(errorLog) : resolve('All good.');

        });
    }

}

/*
good
{
    "address":"bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp",
    "signature":"Hz/Cpvz7u6sHBclp+fMAdcyuvyguMIg7qfaxkZCgSNaqRqGedLgEHbytdBg24GfW8FBtb/z2sguPPY8FM9xsCkw=",
    "message":"bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp:1824163113:starRegistry",
    "star": {
        "dec": "68° 52' 56.9",
        "ra": "16h 29m 1.0s",
        "story": "Testing the story 4"
	}
}


bad
{
    "address":"bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp",
    "signature":"H04CK3KFmHChoD6GoPFthwOvpPCauVLjFJh8Xu1iqF6TXil12GIs4Zz5/Lby/UEreX+QbZPg5eWaApEWoPShf24=",
    "message":"bc1qv65hjy7aagu3skrynesvwv30h5s2hhngw7tsxp:1524165452:starRegistry",
    "star": {
        "dec": "68° 52' 56.9",
        "ra": "16h 29m 1.0s",
        "story": "Testing the story 4"
	}
}


*/

module.exports.Blockchain = Blockchain;
