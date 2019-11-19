const bsv = require("bsv");
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

    const result = await bitindex.tx.send(txhash);
    if (!result || !result.txid) {
        return null;
    }

    return result.txid;
}

async function fire(wif, num, satoshis, target) {
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

    for (var i = 1; i <= num; i++) {
        const txid = await fireForUTXO(privateKey, utxos[0], address, satoshis, target);
        if (!txid) { throw new Error(`error firing tx to target`) }
        console.log(`successfully fired tx to target ${txid}`);
    }

}

if (require.main == module) {
    const wif = "L4Wcacd6Xy1rNEGG3dpThzhZ4rdESaGaaLDoPCboLbAyvv87h4Hf"; // 1LwtBzd2xtRF1U49waq4zvtPYSdD2tan3C
    const num = 5;
    const satoshis = 600;
    const target = "16FxyBsbYdXUo8YnwHGvRpQpW82KmSyVUL"; // synfonaut@moneybutton.com

    console.log("START");
    fire(wif, num, satoshis, target).catch(e => {
        console.log(`ERROR while firing transactions ${e.message}`);
    });
}

// Splitting UTXOs

// Pluggable backend: b2p2p2
// Pluggable backend: bitwork