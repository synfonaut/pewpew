# Pew Pew

![Pew Pew — A Bitcoin SV Transaction Shooter](./pewpew.png)

Pew Pew is a Bitcoin SV transaction shooter, it sends many transactions quickly to a Bitcoin SV address.

It's useful for stress testing and debugging realtime Bitcoin applications.

Pew Pew currently requires a Bitcoin node.

## Setup

`git clone https://github.com/synfonaut/pewpew.git`

`npm install`

Generate a random private key:

`node -e "console.log(require('bsv').PrivateKey.fromRandom().toString())"`

Create a `config.js` file that points to the node you're using and also includes the generated privateKey in `wif`

    export default {
        rpc: { host: "127.0.0.1", user: "root", pass: "bitcoin" },
        peer: { host: "127.0.0.1" },
        wif: "..."
    }

## Usage

Run `pewpew utxos` to retrieve your address, then send a small amount of BSV to begin sending txs.

*Disclamer: This is new and untested code, don't send a lot of money without testing first*

Run `pewpew split` to prepare your utxos, each call generates 25 possible firings

Run `pewpew fire <target>` to send transactions to a Bitcoin address.

You can also specify the number of transactions by running `pewpew fire <target> [num]`



## Author

Created by [@synfonaut](https://twitter.com/synfonaut)
