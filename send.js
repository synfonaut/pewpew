import config from "./config"

import RPCClient from "bitcoind-rpc"

const rpcconfig = Object.assign({
    protocol: "http",
    host: "127.0.0.1",
    port: "8332",
}, config.rpc);


export function sendtx(txhash) {
    return new Promise((resolve, reject) => {
        const rpc = new RPCClient(rpcconfig)
        rpc.sendRawTransaction(txhash, (err, res) => {
            if (err) { reject(err) }
            else { resolve(res) }
        });
    });
}
