const log = require("debug")("pewpew");

import qrcode from "qrcode-terminal"
import program from "commander"

const readline = require("readline");

import { fire } from "./fire"

import * as bit from "./bit"
import * as utxos from "./utxos"
import * as split from "./split"

import { B2P2PBackend, BitworkBackend } from "./backends"

program.on('--help', function(){
  console.log('')
  console.log('Usage:');
  console.log('  $ pewpew generate');
  console.log('  $ pewpew address');
  console.log('  $ pewpew split');
  console.log('  $ pewpew fire 1Jpgfg9fFNKVVGxYgUhuKhdbxTSKBUnVf4');
});

async function balance() {
    let bundle = await bit.fetch();
    if (!bundle) {
        log(`error finding address information, please inspect you .bit file`);
        return;
    }

    utxos.utxos(bundle.ADDRESS).then(results => {
        let balance = 0;
        for (const utxo of results) {
            balance += utxo.satoshis;
        }
        console.log(`\nBALANCE ${balance}`);
    }).catch(e => {
        console.log(`ERROR while fetching utxos ${e.message}`);
    });
}

async function showutxos() {
    let bundle = await bit.fetch();
    if (!bundle) {
        log(`error finding address information, please inspect you .bit file`);
        return;
    }

    utxos.utxos(bundle.ADDRESS).then(results => {
        let balance = 0;
        for (const utxo of results) {
            console.log(`${utxo.satoshis} ${utxo.txid}:${utxo.vout}`);
            balance += utxo.satoshis;
        }
        console.log(`UTXOS ${results.length}`);
        console.log(`\nBALANCE ${balance}`);
    }).catch(e => {
        console.log(`ERROR while fetching utxos ${e.message}`);
    });
}


async function address() {
    let bundle = await bit.fetch();
    if (!bundle) {
        log(`error finding address information, please inspect you .bit file`);
        return;
    }

    qrcode.generate(`bitcoin:${bundle.ADDRESS}`, function(message) {
        console.log("\n");
        console.log("🔫 Pew Pew Transaction Shooter Address");
        console.log("\n");
        console.log(message);
        console.log("\nADDRESS", bundle.ADDRESS);
        balance();
    });
}

program.version("0.0.1");

program
    .command("generate")
    .description("Generate address")
    .action(async function() {
        let bundle = await bit.fetch();
        if (bundle) {
            log(`already generated address`);
        } else {
            log(`generating address`);
            bundle = await bit.generate();
            log(`generated address ${bundle.ADDRESS}`);
            address();
        }
    });

program
    .command("address")
    .description("Display address")
    .action(async function() {
        address();
    });

program
    .command("balance")
    .description("Display balance for address")
    .action(async function() {
        balance();
    });

program
    .command("utxos")
    .description("Display utxos for address")
    .action(async function() {
        showutxos();
    });

program
    .command("split")
    .description("Split utxos in preparation for firing")
    .option("-s, --satoshis <satoshis>", "Change the number of satoshis to send, by default 1000")
    .option("-l, --limit <limit>", "Maximum number of utxos, by default 25")
    .action(async function(args) {
        let bundle = await bit.fetch();
        if (!bundle) {
            log(`error finding address information, please inspect you .bit file`);
            return;
        }

        const satoshis = (args.satoshis ? Number(args.satoshis) : 1000);
        const limit = (args.limit ? Number(args.limit) : 25);

        split.split(bundle.PRIVATE, limit, satoshis).then(function() {
            console.log("FINISHED splitting utxos");
        }).catch(e => {
            console.log(`ERROR while splitting utxos ${e.message}`);
        });
    });

program
    .command("fire <address> [number]")
    .option("-s, --satoshis <satoshis>", "Change the number of satoshis to send, by default 800")
    .description("Fire Pew Pew, sending num Bitcoin transactions to an address")
    .action(async function(address, number, args) {
        let bundle = await bit.fetch();
        if (!bundle) {
            log(`error finding address information, please inspect you .bit file`);
            return;
        }

        const satoshis = (args.satoshis ? Number(args.satoshis) : 800);
        if (!address) {
            console.log(`ERROR invalid address`);
            process.exit();
        }

        const num = (number ? Number(number) : 10);

        const prompt  = readline.createInterface(process.stdin, process.stdout);
        console.log("===================================================");
        console.log("⚠️  WARNING ⚠️");
        console.log(`\nAre you sure you want to FIRE at`);
        console.log(`ADDRESS: ${address}`);
        console.log(`NUMBER: ${num}`);
        console.log(`SATOSHIS: ${satoshis}`);
        console.log(`TOTAL SATOSHIS: ${num * satoshis}`);
        console.log("\n⚠️  WARNING ⚠️");
        console.log("===================================================");
        prompt.setPrompt("Are you sure you want to proceed? [y/N]> ");
        prompt.prompt();
        prompt.on("line", async function(line) {
            if (line == "y") {
                console.log("🔫 FIRE AT WILL");
                const backend = new BitworkBackend();
                backend.ready = function() {
                    console.log("ready");
                    fire(bundle.PRIVATE, num, satoshis, address, backend).catch(e => {
                        console.log(`ERROR while firing transactions`);
                        console.log(e);
                    });
                };
            } else {
                console.log("\nSkipping... CEASE FIRE\n");
            }
            prompt.close();
        });
    });

program.on('command:*', function () {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);

