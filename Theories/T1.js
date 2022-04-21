import { BiggishNumber } from "../Common/BiggishNumber.js";
import { FirstFreeCost, ExponentialCost } from "../Common/Costs.js"
import { Utils } from "../Common/Utils.js";

export class T1 {

    static new() {

        let t1 = new T1();

        t1.currency = [BiggishNumber.ZERO];

        t1.q1 = Utils.makeVariable(0, new FirstFreeCost(new ExponentialCost(5, Math.log2(2))));
        t1.q2 = Utils.makeVariable(0, new ExponentialCost(100, Math.log2(10)));
        t1.c1 = Utils.makeVariable(0, new ExponentialCost(15, Math.log2(2)));
        t1.c2 = Utils.makeVariable(0, new ExponentialCost(3000, Math.log2(10)));
        t1.c3 = Utils.makeVariable(0, new ExponentialCost(1e4, 4.5 * Math.log2(10)));
        t1.c4 = Utils.makeVariable(0, new ExponentialCost(1e10, 8 * Math.log2(10)));
        t1.varlist = ['q1', 'q2', 'c1', 'c2', 'c3', 'c4'];

        t1.tau = BiggishNumber.ONE;
        t1.publicationMultiplier = BiggishNumber.ONE;

        t1.resetHelpers();

        return t1;
    }

    buy(varname, quantity) {
        if (!this.varlist.includes(varname)) throw `unknown var ${varname}`

        const vari = this[varname];

        if (quantity < 0) {
            const delta = vari.cost.getMax(vari.level, this.currency);
            if (delta > 0) {
                const price = vari.cost.getSum(vari.level, delta);
                this.currency[vari.curId] = this.currency[vari.curId].minus(price);
                vari.level += delta;
            } 
        } else {
            const price = vari.cost.getSum(vari.level, quantity);
            if (this.currency[vari.curId].ge(price)) {
                this.currency[vari.curId] = this.currency[vari.curId].minus(price);
                vari.level += quantity;
            }
        }

        switch(varname){
            case 'q1':
            case 'q2':
                this.tickspeed = T1.getTickspeed(this.q1.level, this.q2.level);
                break;
            case 'c1':
                this.vc1 = T1.getC1(this.c1.level).pow(1.15);
                break;
            case 'c2':
                this.vc2 = T1.getC2(this.c2.level);
                break;
            case 'c3':
                this.vc3 = T1.getC3(this.c3.level);
                break;
            case 'c4':
                this.vc4 = T1.getC4(this.c4.level);
                break;
        }
    }

    tick(elapsedTime, multiplier) { // returns remaining time
        if (BiggishNumber.ZERO.eq(this.tickspeed)) return 0;

        if (this.tickspeed.times(elapsedTime).lt(BiggishNumber.ONE)) return elapsedTime;

        const tickPower = this.tickspeed.times(elapsedTime * multiplier);

        this.rhoNm2 = this.rhoNm1;
        this.rhoNm1 = this.rhoN;
        this.rhoN = this.currency[0];

        const bonus = this.publicationMultiplier;
        const term1 = this.rhoN.max(BiggishNumber.ONE).log(Math.E).plus(BiggishNumber.ONE).times(this.vc1).times(this.vc2);
        const term2 = this.rhoNm1.pow(0.2).times(this.vc3);
        const term3 = this.rhoNm2.pow(0.3).times(this.vc4);

        this.currency[0] = term1.plus(term2).plus(term3).times(tickPower).times(bonus).plus(this.rhoN);

        this.tau = this.tau.max(this.currency[0]);

        return 0;
    }

    publish() {
        const newpub = T1.getPublicationMultiplier(this.tau);
        if (newpub.le(this.publicationMultiplier)) return;
        resetHelpers();
        this.publicationMultiplier = newpub;
    }

    resetHelpers() {
        this.varlist.forEach(varname => this[varname].reset());
        this.currency[0] = BiggishNumber.ZERO;
        this.rhoN = BiggishNumber.ZERO;
        this.rhoNm1 = BiggishNumber.ZERO;
        this.rhoNm2 = BiggishNumber.ZERO;

        this.tickspeed = T1.getTickspeed(this.q1.level, this.q2.level);
        this.vc1 = T1.getC1(this.c1.level).pow(1.15);
        this.vc2 = T1.getC2(this.c2.level);
        this.vc3 = T1.getC3(this.c3.level);
        this.vc4 = T1.getC4(this.c4.level);
    }

    static getPublicationMultiplier(tau) { return tau.pow(0.164).div(3); }
    static getQ1(level) { return Utils.getStepwisePowerSum(level, 2, 10, 0); }
    static getQ2(level) { return BiggishNumber.TWO.pow(level); }
    static getC1(level) { return Utils.getStepwisePowerSum(level, 2, 10, 1); }
    static getC1Exponent(level) { return 1 + 0.05 * level; }
    static getC2(level) { return BiggishNumber.TWO.pow(level); }
    static getC3(level) { return BiggishNumber.TEN.pow(level); }
    static getC4(level) { return BiggishNumber.TEN.pow(level); }
    static getTickspeed(q1level, q2level) { return T1.getQ1(q1level).times(T1.getQ2(q2level)); }

}