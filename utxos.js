import bsv from "bsv";

const bitindex = require('bitindex-sdk').instance();

export async function utxos(wif) {
    const address = bsv.Address.fromPrivateKey(bsv.PrivateKey(wif)).toString();
    return await bitindex.address.getUtxos(address);
}
