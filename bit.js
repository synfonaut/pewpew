const log = require("debug")("pewpew:bit");

import fs from "fs"
import path from "path"
import bsv from "bsv"

import * as helpers from "./helpers"

// fetch and generate new .bit files
export async function generate(file=".bit") {

    const filepath = path.join(process.cwd(), file);
    if (fs.existsSync(filepath)) {
        throw new Error(`existing ${file} file found, please move it before writing a new one`);
    }

    const privateKey = bsv.PrivateKey.fromRandom();

    const PRIVATE = privateKey.toString();
    const ADDRESS = bsv.Address.fromPrivateKey(privateKey).toString();
    const PUBLIC = bsv.PublicKey.fromPrivateKey(privateKey).toString();

    const bundle = { PRIVATE, ADDRESS, PUBLIC };

    write(bundle);

    const written = await fetch(file);
    if (!written || written.ADDRESS !== ADDRESS) {
        throw new Error("error while writing new address, didn't match the one generated");
    }

    return bundle;
}

export async function read(file=".bit") {
    const filepath = path.join(process.cwd(), file);
    if (fs.existsSync(filepath)) {
        const contents = fs.readFileSync(filepath, "utf8");
        return contents;
    } else {
        return null;
    }
}

export async function write(bundle, file=".bit") {
    const filepath = path.join(process.cwd(), file);
    if (fs.existsSync(filepath)) {
        throw new Error(`existing .bit file found, please move it before writing a new one`);
    }

    const content = Object.entries(bundle).map(([key, value]) => {
        return `${key.toUpperCase()}=${value}`;
    }).join("\n");

    log(`writing ${content.length} bytes to ${file}`);

    fs.writeFileSync(filepath, content, "utf8");
    return true;
}


export function parse(bit) {
    const lines = Object.fromEntries(bit.split("\n").filter(line => !!line).map(line => {
        return line.split("=");
    }));
    //log(`parsing ${JSON.stringify(lines, null, 4)}`);
    return lines;
}

export async function fetch(file=".bit") {
    const contents = await read(file);
    if (contents) {
        const bundle = parse(contents);

        // VERIFY
        const address = bsv.Address.fromPrivateKey(bsv.PrivateKey(bundle.PRIVATE)).toString();
        if (address !== bundle.ADDRESS) {
            throw new Error(`error while validating the bundle, the private key doesn't match the address`);
        }

        log(`loaded .bit with address ${bundle.ADDRESS}`);
        return bundle;
    }
}

/*
import fs from "fs"
import ReadLastLines from "read-last-lines"

export function get(file) {
    return new Promise((resolve, reject) => {
        ReadLastLines.read(file, 10).then(str => {
            const lines = str.split("\n").filter(line => !!line);
            const last = lines.pop();
            const line = last.split(" ");
            if (line.length !== 5) { throw new Error("expected tape to have 4 elements") }
            if (line[0] === "BLOCK") {
                const height = Number(line[1]);
                resolve(height);
            } else {
                resolve(null);
            }
        }).catch(e => {
            resolve(null);
        });
    });
}

export function write(line, file) {
    return new Promise((resolve, reject) => {
        try {
            fs.appendFileSync(file, `${line}\n`);
            resolve(true);
        } catch (e) {
            reject(e);
        }
    });
}
*/
