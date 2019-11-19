import config from "./config"
import { sendtx } from "./send"

import bsv from "bsv";
const bitindex = require('bitindex-sdk').instance();

async function fireForUTXO(privateKey, utxo, changeAddress, satoshis, target) {
    if (!privateKey) { throw new Error(`shooter requires a privateKey`) }
    if (!utxo) { throw new Error(`shooter requires a utxo`) }
    if (!target) { throw new Error(`shooter requires a target`) }
    if (!changeAddress) { throw new Error(`shooter requires a change address`) }
    if (!Number.isInteger(satoshis)) { throw new Error(`shooter requires an amount`) }

    const tx = bsv.Transaction()
        .from([utxo])
        .to(target, satoshis)
        .change(changeAddress);

    tx.sign(privateKey);

    const txhash = tx.serialize();

    //const result = await bitindex.tx.send(txhash);
    const result = await sendtx(txhash);

    if (result.error) {
        console.log("error while sending tx for utxo", utxo);
        throw new Error(`error while sending tx ${result.error}`);
    }

    return result.result;
}

export async function fire(wif, num, satoshis, target, backend) {
    console.log("starting transaction shooter");
    if (!wif) { throw new Error(`shooter requires a wif`) }
    if (!target) { throw new Error(`shooter requires a target`) }
    if (!Number.isInteger(num)) { throw new Error(`shooter requires a num`) }
    if (!Number.isInteger(satoshis)) { throw new Error(`shooter requires an amount`) }

    const privateKey = bsv.PrivateKey(wif);
    const address = bsv.Address.fromPrivateKey(privateKey).toString();
    console.log(`loading private key ${wif} that owns address ${address}`);

    const utxos = await bitindex.address.getUtxos(address);
    if (utxos.length < num) { throw new Error(`don't have enough utxos, need to split them`) }

    const sats = utxos.map(utxo => { return utxo.satoshis }).reduce((a, b) => a + b, 0);
    console.log(`found ${utxos.length} utxos worth ${sats} satoshis`);

    const expectedSpend = (num * satoshis);
    if (expectedSpend > sats) { throw new Error(`don't have enough money to send ${expectedSpend} satoshis to ${target}`) }

    let curr = 0;
    for (const utxo of utxos) {
        const txid = await fireForUTXO(privateKey, utxo, address, satoshis, target);
        if (!txid) { throw new Error(`error firing tx to target`) }

        backend.add(txid);

        curr += 1;
        console.log(`🔫 FIRE ${txid}`);

        if (curr >= num) {
            console.log(`FIRED ${curr}/${num} targets`);
            break;
        }
    }

    backend.wait();
}

