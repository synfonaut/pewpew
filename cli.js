#!/usr/bin/env node --require esm

import { fire } from "./fire"
import { split } from "./split"
import { utxos } from "./utxos"
import { B2P2PBackend } from "./backends"

if (require.main == module) {
    const wif = "L4Wcacd6Xy1rNEGG3dpThzhZ4rdESaGaaLDoPCboLbAyvv87h4Hf";

    if (process.argv[2] == "split") {
        const num = 25;
        const satoshis = 1000;

        split(wif, num, satoshis).catch(e => {
            console.log(`ERROR while splitting utxos ${e.message}`);
        });
    } else if (process.argv[2] == "fire") {
        const num = 25;
        const satoshis = 800;
        const target = "1KbiAScTy2fAeVp1rAs1e7LPCtvTgUqNMz"; // xanadu@simply.cash

        const backend = new B2P2PBackend();
        backend.ready = function() {
            console.log("backend ready");
            fire(wif, num, satoshis, target, backend).catch(e => {
                console.log(`ERROR while firing transactions ${e.message}`);
            });
        };
    } else if (process.argv[2] == "utxos") {
        utxos(wif).then(results => {
            for (const utxo of results) {
                console.log(utxo.satoshis, `${utxo.txid}:${utxo.vout}`);
            }
            console.log(`${results.length} utxos total`);
        }).catch(e => {
            console.log(`ERROR while fetching utxos ${e.message}`);
        });
    } else {
        console.log("available commands");
        console.log("  utxos\t— show utxos");
        console.log("  split\t— prepare by splitting utxos");
        console.log("  fire\t— send txs");
    }
}

// Pluggable backend: bitwork

