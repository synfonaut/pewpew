import { fire } from "./fire"
import { split } from "./split"
import { utxos } from "./utxos"

if (require.main == module) {
    const wif = "L4Wcacd6Xy1rNEGG3dpThzhZ4rdESaGaaLDoPCboLbAyvv87h4Hf";

    if (process.argv[2] == "split") {
        const num = 300;
        const satoshis = 3000;

        split(wif, num, satoshis).catch(e => {
            console.log(`ERROR while splitting utxos ${e.message}`);
        });
    } else if (process.argv[2] == "fire") {
        const num = 5;
        const satoshis = 800;
        const target = "1KbiAScTy2fAeVp1rAs1e7LPCtvTgUqNMz"; // xanadu@simply.cash

        fire(wif, num, satoshis, target).catch(e => {
            console.log(`ERROR while firing transactions ${e.message}`);
        });
    } else if (process.argv[2] == "utxos") {
        utxos(wif).then(results => {
            for (const utxo of results) {
                console.log(utxo.satoshis, `${utxo.txid}:${utxo.vout}`);
            }
        }).catch(e => {
            console.log(`ERROR while fetching utxos ${e.message}`);
        });
    }
}

// Pluggable backend: b2p2p2
// Pluggable backend: bitwork

