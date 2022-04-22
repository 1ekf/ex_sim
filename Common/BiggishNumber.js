export class BiggishNumber {
    constructor(m, e) {
        this.m = m;
        this.e = e;
    }

    static makeResolved(m, e) { // Internal use only
        const num = new BiggishNumber(m, e);
        num.resolve();
        return num;
    }

    static from(v) {
        const num = Number(v);

        if (num == 0) return BiggishNumber.ZERO;

        const e = Math.floor(Math.log10(Math.abs(num)));
        const m = num / Math.pow(10, e);

        return new BiggishNumber(m, e);
    }

    static fromPow(b, exp) {
        if (b == 0) return BiggishNumber.ZERO;
        if (b < 0) throw "can't take exp of negative";

        const rawe = (b != 10) ? Math.log10(b) * exp : exp;
        const e = Math.floor(rawe);
        const m = Math.pow(10, rawe - e);

        return new BiggishNumber(m, e);
    }
    
    toString() {
        return (this.m != 0) ? (this.e ? `${this.m}e${this.e}` : `${this.m}`) : "0"
    }

    copy() {
        return new BiggishNumber(this.m, this.e);
    }

    resolve() {
        if (this.m == 0) {
            this.e = -Infinity
        } else if (this.m >= 10 || this.m <= -10) {
            this.m /= 10;
            this.e += 1;
        } else if (this.m >= 1 || this.m <= -1) {
            // noop
        } else if (this.m >= 0.1 || this.m <= -0.1) {
            this.m *= 10;
            this.e -= 1;
        } else {
            const diffe = Math.floor(Math.log10(Math.abs(this.m)));
            this.m *= Math.pow(10, -diffe);
            this.e += diffe;
        }
    }
    
    plus(that) {
        if (!(that instanceof BiggishNumber)) return this.plus(BiggishNumber.from(that));

        if (this.m == 0) return that;
        if (that.m == 0) return this;

        if (this.e < that.e) return that.plus(this);

        const newm = this.m + that.m * Math.pow(10, that.e - this.e);

        return BiggishNumber.makeResolved(newm, this.e);
    }

    dPlus(that) {
        if (!(that instanceof BiggishNumber)) return this.dPlus(BiggishNumber.from(that));

        if (this.m == 0) return that;
        if (that.m == 0) return this;

        if (this.e < that.e) return that.plus(this);

        this.m += that.m * Math.pow(10, that.e - this.e);

        this.resolve();

        return this;
    }

    times(that) {
        if (!(that instanceof BiggishNumber)) return this.times(BiggishNumber.from(that));

        if (this.m == 0 || that.m == 0) return BiggishNumber.ZERO;

        return BiggishNumber.makeResolved(this.m * that.m, this.e + that.e);
    }

    dTimes(that) {
        if (!(that instanceof BiggishNumber)) return this.dTimes(BiggishNumber.from(that));

        if (this.m == 0 || that.m == 0) return this.toZero();

        this.m *= that.m;
        this.e += that.e;

        this.resolve();

        return this;
    }

    minus(that) {
        if (!(that instanceof BiggishNumber)) return this.minus(BiggishNumber.from(that));

        if (this.m == 0) return new BiggishNumber(-that.m, that.e);
        if (that.m == 0) return this;

        return this.plus(new BiggishNumber(-that.m, that.e));
    }

    dMinus(that) {
        if (!(that instanceof BiggishNumber)) return this.dMinus(BiggishNumber.from(that));

        if (that.m == 0) return this;

        that.m *= -1;
        return this.dPlus(that);
    }

    div(that) {
        if (!(that instanceof BiggishNumber)) return this.div(BiggishNumber.from(that));

        if (that.m == 0) throw "division by zero";

        return this.times(BiggishNumber.makeResolved(1/that.m, -that.e));
    }

    dDiv(that) {
        if (!(that instanceof BiggishNumber)) return this.div(BiggishNumber.from(that));

        if (that.m == 0) throw "division by zero";

        this.m /= that.m;
        this.e -= that.e;

        this.resolve();
        return this;
    }

    sqrt() {
        if (this.m < 0) throw "sqrt of negative";
        if (this.m == 0) return BiggishNumber.ZERO;

        let newm = Math.sqrt(this.m);
        if (this.e % 2) {
            newm *= Math.sqrt(10);
        }

        return new BiggishNumber(newm, Math.trunc(this.e / 2));
    }

    dSqrt() {
        if (this.m < 0) throw "sqrt of negative";
        if (this.m == 0) return this.toZero();

        this.m = Math.sqrt(this.m);
        if (this.e % 2) {
            this.m *= Math.sqrt(10);
        }
        this.e = Math.trunc(this.e / 2)

        return this;
    }

    log(b) {
        if (this.m <= 0) throw "log of nonpositive";
        if (b <= 0) throw "log base nonpositive"
        
        b = b ?? 10;

        return BiggishNumber.from((Math.log10(this.m) + this.e) / Math.log10(b) );
    }

    dLog(b) {
        return this.log(b);
    }

    pow(x) {
        if (this.m < 0) throw "pow of negative";
        if (this.m == 0) return BiggishNumber.ZERO;

        const mpart = BiggishNumber.fromPow(this.m, x);
        const eraw = this.e * x;
        if (Number.isInteger(eraw)) {
            mpart.e += eraw;
            return mpart;
        }

        const epart = BiggishNumber.fromPow(10, eraw);

        return mpart.times(epart);
    }

    dPow(x) {
        if (this.m < 0) throw "pow of negative";
        if (this.m == 0) return this.toZero();

        const mpart = BiggishNumber.fromPow(this.m, x);
        const eraw = this.e * x;
        if (Number.isInteger(eraw)) {
            mpart.e += eraw;
            return mpart;
        }

        const epart = BiggishNumber.fromPow(10, eraw);

        return mpart.dTimes(epart);
    }


    comp(that) {
        if (!(that instanceof BiggishNumber)) return this.gr(BiggishNumber.from(that));

        if (this.m < 0) {
            if (that.m >= 0) return -1;
            if (this.e < that.e) return 1;
            if (this.e > that.e) return -1;
        } else if (this.m > 0){
            if (that.m <= 0) return 1;
            if (this.e < that.e) return -1;
            if (this.e > that.e) return 1;
        }

        if (this.m < that.m) return -1;
        if (this.m > that.m) return 1;
        
        return 0;
    }

    max(that) {
        if (!(that instanceof BiggishNumber)) return this.max(BiggishNumber.from(that));

        return this.comp(that) >= 0 ? this : that;
    }

    min(that) {
        if (!(that instanceof BiggishNumber)) return this.min(BiggishNumber.from(that));

        return this.comp(that) <= 0 ? this : that;
    }

    gt(that) { return this.comp(that) == 1; }

    ge(that) { return this.comp(that) >= 0; }

    eq(that) { return this.comp(that) == 0; }

    le(that) { return this.comp(that) <= 0; }

    lt(that) { return this.comp(that) == -1; }

    toZero() {
        this.m = 0;
        this.e = -Infinity;
        return this;
    };

    toInt() {
        if (this.m == 0) return 0;
        return Math.trunc(this.m * Math.pow(10, this.e));
    }

    toFloat() {
        if (this.m == 0) return 0.0;
        return this.m * Math.pow(10, this.e);
    }
}
BiggishNumber.ZERO = BiggishNumber.makeResolved(0, 0);
BiggishNumber.ONE = BiggishNumber.makeResolved(1, 0);
BiggishNumber.TWO = BiggishNumber.makeResolved(2, 0);
BiggishNumber.TEN = BiggishNumber.makeResolved(10, 0);
BiggishNumber.INF = new BiggishNumber(1, Infinity)


// var tick = (elapsedTime, multiplier) => {
//     let tickspeed = getTickspeed();

//     if (tickspeed.isZero)
//         return;

//     let timeLimit = 1 / tickspeed.Min(BigNumber.TEN).toNumber();
//     time += elapsedTime;

//     if (time >= timeLimit - 1e-8) {
//         let tickPower = tickspeed * BigNumber.from(time * multiplier);

//         rhoNm2 = rhoNm1;
//         rhoNm1 = rhoN;
//         rhoN = currency.value;

//         let bonus = theory.publicationMultiplier;
//         let vc1 = getC1(c1.level).pow(getC1Exponent(c1Exp.level));
//         let vc2 = getC2(c2.level);
//         let vc3 = getC3(c3.level);
//         let vc4 = getC4(c4.level);
//         let term1 = vc1 * vc2 * (logTerm.level > 0 ? BigNumber.ONE + rhoN.Max(BigNumber.ONE).log() / BigNumber.HUNDRED : BigNumber.ONE);
//         let term2 = c3Term.level > 0 ? (vc3 * rhoNm1.pow(0.2)) : BigNumber.ZERO;
//         let term3 = c4Term.level > 0 ? (vc4 * rhoNm2.pow(0.3)) : BigNumber.ZERO;

//         currency.value = rhoN + bonus * tickPower * (term1 + term2 + term3) + epsilon;

//         time = 0;
//     }
// }