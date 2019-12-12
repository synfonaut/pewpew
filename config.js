let defaultOptions = {
    rpc: { host: "127.0.0.1", user: "root", pass: "bitcoin" },
    peer: { host: "127.0.0.1" },
};

const rpc = {
    "host": process.env.RPC_HOST,
    "user": process.env.RPC_USER,
    "pass": process.env.RPC_PASS,
};

const peer = {
    "host": process.env.PEER_HOST
};

let config = Object.assign({}, defaultOptions, { rpc }, { peer });

export default config;

