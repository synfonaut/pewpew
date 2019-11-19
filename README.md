# 🔫 Pew Pew

![Pew Pew — Bitcion SV Transaction Shooter][/pewpew.jpg]

Pew Pew is a Bitcoin SV transaction shooter.

## Setup

Create a `config.js` file that points to the node you're using

    export default {
        rpc: { host: "127.0.0.1", user: "root", pass: "bitcoin" },
        peer: { host: "127.0.0.1" },
        wif: "..."
    }

## Usage

Run the `pewpew` command with one of the subcommands

### UTXOS

See which utxos are available for your `wif` with `pewpew utxos`
