import { BiggishNumber } from "./BiggishNumber.js";

export class Utils {

    static getStepwisePowerSum(level, basePower, stepLength, offset) { 
        const quotient = Math.floor(level / stepLength);
        const remainder = level - quotient * stepLength;
        return BiggishNumber.fromPow(basePower, quotient).minus(1).times(stepLength / (basePower - 1) + remainder).plus(remainder + offset);
    }

    static makeVariable(curId, cost) {
        return {
            level: 0,
            curId: curId,
            cost: cost,
            reset() {this.level = 0;}
        }
    }

}