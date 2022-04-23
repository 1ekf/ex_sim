export class T1Auto {

    constructor(t1) {
        this.t1 = t1;
        this.pCurrency = undefined;
        this.costs = {};
        t1.varlist.forEach(name => {
            const vari = t1[name];
            this.costs[name] = vari.cost.getCost(vari.level)
        });
    }

    updateMincost() {

        const mincost = {};

        this.t1.varlist.forEach(name => {
            const cost = this.costs[name];
            const curId = this.t1[name].curId;
            if (mincost[curId] === undefined || mincost[curId].gt(cost)) {
                mincost[curId] = cost;
            }
        })

        this.mincost = mincost;
    }

    buy() { // returns whether a purchase was made
        let bought = false;
        for (let name of this.t1.varlist) {
            const vari = this.t1[name]
            if (this.t1.buy(name, -1)) {
                this.costs[name] = vari.cost.getCost(vari.level);
                bought = true;
            }
        }

        if (bought) {
            this.updateMincost();
            this.pCurrency = undefined;
        }

        return bought;
    }

    timeRequest(prevStep) {
        if (this.pCurrency === undefined) return 0.1;

        const deltas = this.t1.currency.map((cur, i) => cur.minus(this.pCurrency[i]));

        if (deltas.every(delta => delta.m <= 0)) return 0.1;

        const needs = this.t1.currency.map((cur, i) => this.mincost[i].minus(cur));

        if (needs.some(need => need.m <= 0)) throw "something isn't bought";
        
        const newSteps = needs.map((need, i) => {
            return deltas[i].m > 0 ? need.dDiv(deltas[i]).toFloat() : Infinity;
        })
        
        return Math.max(Math.min(Math.min(...newSteps) * prevStep / 1024, 10), 0.1);
    }

    tick(stepSize, multiplier, r9) {
        this.pCurrency = [...this.t1.currency];
        this.t1.tick(stepSize, multiplier, r9);
    }

}