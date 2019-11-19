#!/usr/bin/env node --require esm

const readline = require("readline");

import config from "./config"
import { fire } from "./fire"
import { split } from "./split"
import { utxos } from "./utxos"
import { B2P2PBackend, BitworkBackend } from "./backends"

if (require.main == module) {
    if (process.argv[2] == "split") {
        const satoshis = 1000;

        split(config.wif, 25, satoshis).catch(e => {
            console.log(`ERROR while splitting utxos ${e.message}`);
        });
    } else if (process.argv[2] == "fire") {

        const satoshis = 800;
        const target = process.argv[3];
        if (!target) {
            console.log(`ERROR invalid target`);
            process.exit();
        }

        const num = (process.argv[4] ? Number(process.argv[4]) : 10);

        const prompt  = readline.createInterface(process.stdin, process.stdout);
        console.log("===================================================");
        console.log("⚠️  WARNING ⚠️");
        console.log(`\nAre you sure you want to FIRE:`);
        console.log(`number: ${num}`);
        console.log(`satoshis: ${satoshis}`);
        console.log(`target: ${target}`);
        console.log("⚠️  WARNING ⚠️");
        console.log("===================================================");
        prompt.setPrompt("Are you sure you want to proceed? [y/N]> ");
        prompt.prompt();
        prompt.on("line", async function(line) {
            if (line == "y") {
                console.log("🔫 FIRE AT WILL");
                const backend = new BitworkBackend();
                backend.ready = function() {
                    console.log("backend ready");
                    fire(config.wif, num, satoshis, target, backend).catch(e => {
                        console.log(`ERROR while firing transactions ${e.message}`);
                    });
                };
            } else {
                console.log("\nSkipping... CEASE FIRE\n");
            }
            prompt.close();
        });

    } else if (process.argv[2] == "utxos") {
        utxos(config.wif).then(results => {
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

