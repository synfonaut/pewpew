const bsv = require("bsv");
const bitindex = require('bitindex-sdk').instance();

async function splitUTXO(privateKey, utxo, changeAddress, num, satoshis) {
    if (!privateKey) { throw new Error(`shooter requires a privateKey`) }
    if (!utxo) { throw new Error(`shooter requires a utxo`) }
    if (!changeAddress) { throw new Error(`shooter requires a change address`) }
    if (!Number.isInteger(num)) { throw new Error(`shooter requires number of txs to split`) }
    if (!Number.isInteger(satoshis)) { throw new Error(`shooter requires an amount`) }

    if (utxo.satoshis <= satoshis) {
        console.log(`skipping utxo ${utxo.txid}:${utxo.vout}, already split`);
        return 0;
    }

    const tx = bsv.Transaction().from([utxo]).change(changeAddress);
    let totalsatoshis = 0;
    let numsplit;
    let hasaddress = false;
    for (numsplit = 0; numsplit < num; numsplit++) {
        totalsatoshis += satoshis;
        if (totalsatoshis > utxo.satoshis) {
            break;
        }

        tx.to(changeAddress, satoshis);
        hasaddress = true;
    }

    if (!hasaddress) {
        console.log(`unable to split ${utxo.txid}:${utxo.vout}`);
        return 0;
    }
    tx.sign(privateKey);

    const txhash = tx.serialize();

    const result = await bitindex.tx.send(txhash);
    if (!result || !result.txid) {
        return 0;
    }

    console.log("split txid", result.txid);

    return numsplit;
}


export async function split(wif, num, satoshis) {
    console.log("preparing transaction shooter by splitting utxos");

    if (!wif) { throw new Error(`shooter requires a wif`) }
    if (!Number.isInteger(num)) { throw new Error(`shooter requires a num`) }
    if (!Number.isInteger(satoshis)) { throw new Error(`shooter requires an amount`) }

    const privateKey = bsv.PrivateKey(wif);
    const address = bsv.Address.fromPrivateKey(privateKey).toString();
    console.log(`loading private key ${wif} that owns address ${address}`);

    const utxos = await bitindex.address.getUtxos(address);
    let split = 0;
    for (const utxo of utxos) {
        const numsplit = await splitUTXO(privateKey, utxo, address, num, satoshis);
        console.log(`SPLIT ${numsplit} utxos from ${utxo.txid}:${utxo.vout} into ${satoshis} each`);
        split += numsplit;
        if (split >= num) {
            console.log("SUCCESS splitting utxo");
            break;
        }
    }
}

