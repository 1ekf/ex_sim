import { BiggishNumber } from "./BiggishNumber.js";

export class FirstFreeCost {
    constructor(costModel) {
        this.getCost = level => (level ? costModel.getCost(level - 1) : 0);
        this.getSum = (fromLevel, toLevel) => (costModel.getSum(fromLevel ? fromLevel-1 : 0, toLevel-1));
        this.getMax = (fromLevel, currency) => (fromLevel ? costModel.getMax(fromLevel-1, currency) : 1+costModel.getMax(0, currency));
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

        this.getCost = level => initialCost.plus(progress * level);
        this.getSum = (fromLevel, toLevel) => progress.times(1 + fromLevel + toLevel).div(2).plus(initialCost).times(toLevel - fromLevel);
        this.getMax = (fromLevel, currency) => {
            const basis = initialCost.div(progress).plus(0.5 + fromLevel);
            return basis.times(basis).plus(currency.div(progress).times(2)).sqrt().minus(basis).toInt();
        };
    }
}

export class ExponentialCost {
    constructor(initialCost, progress) {
        if (!(initialCost instanceof BiggishNumber)) initialCost = BiggishNumber.from(initialCost);
        if (progress instanceof BiggishNumber) progress = progress.toFloat();

        this.getCost = level => BiggishNumber.fromPow(2, progress * level).times(initialCost);
        this.getSum = (fromLevel, toLevel) => {
            const twoprogress = BiggishNumber.fromPow(2, progress);
            const price0 = twoprogress.pow(1 + fromLevel);
            const price1 = twoprogress.pow(1 + toLevel);
            return price1.minus(price0).div(twoprogress.minus(1)).times(initialCost);
        }
        this.getMax = (fromLevel, currency) => {
            const twoprogress = BiggishNumber.fromPow(2, progress);
            const price0 = twoprogress.pow(1 + fromLevel);
            return twoprogress.minus(1).times(currency).div(price0).div(initialCost).plus(1).log(2).div(progress).toInt();
        }
    }
}