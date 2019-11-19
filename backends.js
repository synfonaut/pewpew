import config from "./config"

import { Peer, Messages, Inventory } from "b2p2p"
import bitwork from "bitwork"
import bsv from "bsv"
import txo from "txo"

class Backend {
    constructor() {
        this.peer = null;
        this.txids = {};
        this.ready = () => {};
        this.waitInterval = null;
        this.startTime = Date.now()
    }

    add(txid) {
        this.txids[txid] = false;
    }

    has(txid) {
        return this.txids[txid] === false;
    }

    complete(txid) {
        console.log("💦 HIT", txid);
        this.txids[txid] = true;
    }

    finished() {
        return Object.values(this.txids).every(txid => txid === true);
    }

    incomplete() {
        return Object.entries(this.txids).map(([txid, complete]) => {
            if (!complete) {
                return txid;
            }
        }).filter(txid => txid);
    }

    num() {
        return Object.keys(this.txids).length;
    }

    clear() {
        clearInterval(this.waitInterval);
        this.waitInterval = null;
    }

    reset() {
        this.clear();
        this.peer.disconnect();
    }

    wait(max=100) {
        if (this.waitInterval) {
            this.clear();
        }

        let curr = 0;
        this.waitInterval = setInterval(() => {
            if (this.finished()) {
                const diff = (Date.now() - this.startTime) / 1000;
                console.log(`✅ SUCCESS FIRED AND HIT ${this.num()} txs IN ${diff} SECONDS`);
                this.reset();
            } else {
                console.log("WAIT for finish");
                for (const txid of this.incomplete()) {
                    console.log("WAIT ON", txid);
                }
            }

            if (++curr > max) {
                console.log("🔴 ERROR stopped waiting, exceeded max");
                this.reset();
            }
        }, 1000);
    }

    ready(fn) {
        this.ready = fn;
    }
}

export class B2P2PBackend extends Backend {

    constructor() {
        super();

        const messages = new Messages({ Block: bsv.Block, BlockHeader: bsv.BlockHeader, Transaction: bsv.Transaction, MerkleBlock: bsv.MerkleBlock });
        this.peer = new Peer({ host: config.peer.host, messages });

        this.peer.on("ready", () => {
            console.log("peer connected");
            this.ready();
        });

        this.peer.on("inv", (message) => {
            //console.log("peer inventory");
            message.inventory.forEach((i) => {
                let txid = i.hash.toString('hex').match(/.{2}/g).reverse().join("");
                if (this.has(txid)) {
                    this.complete(txid);
                }
            })
        });

        this.peer.on("disconnect", () => {
            console.log("peer disconnected");
        });

        this.peer.on("error", (message) => {
            console.log("peer error", message);
        });

        this.peer.connect()
    }
}

export class BitworkBackend extends Backend {

    constructor() {
        super();
        // Remember to replace the "user" and "pass" with your OWN JSON-RPC username and password!
        const bit = new bitwork({ rpc: config.rpc, peer: config.peer });
        bit.on("ready", async () => {
            bit.on("mempool", (e) => {
                console.log(e.tx)
            })

            this.ready();
        })

    }
}
