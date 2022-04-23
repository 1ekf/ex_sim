import { T1 } from "../Theories/T1.js"
import { BiggishNumber } from "../Common/BiggishNumber.js"
import { T1Auto } from "../Strategies/T1Auto.js"

var t1 = T1.new();
t1.tau = new BiggishNumber(1, 500);
t1.publish();

var t1a = new T1Auto(t1);

const multiplier = 1.5;
const r9 = Math.pow(261/20, 3);

let tottime = 0;
let stepSize = 0.1;

console.time("performance")
while (tottime < 1e6) {
    t1a.buy();
    stepSize = t1a.timeRequest(stepSize);
    stepSize = stepSize > 0.1 ? stepSize : 0.1;
    t1a.tick(stepSize, multiplier, r9);
    tottime += stepSize;
}
console.timeEnd("performance");

let format = {}
t1.varlist.forEach(name => {format[name] = t1[name].level})
format.currency = t1.currency[0].toString();
format.tau = t1.tau.toString();
format.tottime = tottime;
console.log(JSON.stringify(format));
