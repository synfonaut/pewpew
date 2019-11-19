import { fire } from "./fire"
import { split } from "./split"

if (require.main == module) {
    const wif = "L4Wcacd6Xy1rNEGG3dpThzhZ4rdESaGaaLDoPCboLbAyvv87h4Hf"; // 1LwtBzd2xtRF1U49waq4zvtPYSdD2tan3C

    if (process.argv[2] == "split") {
        const num = 5;
        const satoshis = 1000;

        split(wif, num, satoshis);
    } else if (process.argv[2] == "fire") {
        const num = 5;
        const satoshis = 800;
        const target = "16FxyBsbYdXUo8YnwHGvRpQpW82KmSyVUL"; // synfonaut@moneybutton.com

        fire(wif, num, satoshis, target).catch(e => {
            console.log(`ERROR while firing transactions ${e.message}`);
        });
    }
}

// Sending bulk fire with connected peer
// Pluggable backend: b2p2p2
// Pluggable backend: bitwork

