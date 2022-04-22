import { BiggishNumber } from "./BiggishNumber.js";

export class FirstFreeCost {
    constructor(costModel) {
        this.getCost = level => (level ? costModel.getCost(level - 1) : 0);
        this.getSum = (fromLevel, toLevel) => (toLevel > 0 ? costModel.getSum(fromLevel > 0 ? fromLevel-1 : 0, toLevel-1) : BiggishNumber.ZERO);
        this.getMax = (fromLevel, currency) => (fromLevel > 0 ? costModel.getMax(fromLevel-1, currency) : 1+costModel.getMax(0, currency));
    }
}

export class ConstantCost {
    constructor(cost) {
        if (!(cost instanceof BiggishNumber)) cost = BiggishNumber.from(cost);

        this.getCost = level => cost;
        this.getSum = (fromLevel, toLevel) => cost.times(toLevel - fromLevel);
        this.getMax = (fromLevel, currency) => currency.div(cost).toInt();
    }
}

export class LinearCost {
    constructor(initialCost, progress) {
        if (!(initialCost instanceof BiggishNumber)) initialCost = BiggishNumber.from(initialCost);
        if (!(progress instanceof BiggishNumber)) progress = BiggishNumber.from(progress);

        this.getCost = level => progress.times(level).dPlus(initialCost);
        this.getSum = (fromLevel, toLevel) => progress.times(fromLevel + toLevel - 1).dDiv(2).dPlus(initialCost).times(toLevel - fromLevel);
        this.getMax = (fromLevel, currency) => {
            const basis = BiggishNumber.from(0.5 - fromLevel).dMinus(initialCost.div(progress));
            return basis.times(basis).dPlus(currency.div(progress).dTimes(2)).dSqrt().dPlus(basis).toInt();
        };
    }
}

export class ExponentialCost {
    constructor(initialCost, progress) {
        if (!(initialCost instanceof BiggishNumber)) initialCost = BiggishNumber.from(initialCost);
        if (progress instanceof BiggishNumber) progress = progress.toFloat();

        this.getCost = level => BiggishNumber.fromPow(2, progress * level).dTimes(initialCost);
        this.getSum = (fromLevel, toLevel) => {
            const twoprogress = BiggishNumber.fromPow(2, progress);
            const price0 = twoprogress.pow(fromLevel);
            const price1 = twoprogress.pow(toLevel);
            return price1.dMinus(price0).dDiv(twoprogress.dMinus(1)).dTimes(initialCost);
        }
        this.getMax = (fromLevel, currency) => {
            const twoprogress = BiggishNumber.fromPow(2, progress);
            const price0 = twoprogress.pow(fromLevel);
            return twoprogress.dMinus(1).dTimes(currency).dDiv(initialCost).dPlus(price0).dLog(2).dDiv(progress).toInt() - fromLevel;
        }
    }
}