

class Backend {
}

export class B2P2PBackend extends Backend {
}

export class BitworkBackend extends Backend {
}

/*
*/

/*
const { Peer, Messages, Inventory } = require("b2p2p");
const bsv = require("bsv");
const txo = require("txo");

const host = "209.50.56.81";
const messages = new Messages({ Block: bsv.Block, BlockHeader: bsv.BlockHeader, Transaction: bsv.Transaction, MerkleBlock: bsv.MerkleBlock });
const peer = new Peer({ host, messages });

peer.on("ready", function() {
    console.log("CONNECTED", peer.version, peer.subversion, peer.bestHeight);
    const message = peer.messages.MemPool();
    peer.sendMessage(message);
});

peer.on("disconnect", function() {
    console.log("CLOSED");
});

peer.on("tx", async function(message) {
    const tx = await txo.fromTx(String(message.transaction));
    console.log("TX", tx.tx.h);
});

peer.on("inv", function(message) {
    console.log("INV");
    peer.sendMessage(peer.messages.GetData(message.inventory))

    peer.mempool = new Set()
    message.inventory.forEach((i) => {
        let hash = i.hash.toString('hex').match(/.{2}/g).reverse().join("")
        peer.mempool.add(hash)
    })

    peer.sendMessage(peer.messages.GetData(message.inventory))
});

peer.on("error", function(message) {
    console.log("ERR", message);
});

console.log("START");
peer.connect()

*/

