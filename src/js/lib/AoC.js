export default class AoC {

    /**
     * Day 1 - Part 1 & 2
     * Get the number of increasing depths
     * https://adventofcode.com/2021/day/1
     */
    static getIncreasingDepthsNum(depthArray, windowLength) {
        let increasingDepthsNum = 0;
        const windowLengthOffset = windowLength - 1;

        for (let i = 1; i < depthArray.length - windowLengthOffset; ++i) {
            // sum previous group
            const previousGroupSum = this.sumGroup(depthArray, i - 1, windowLength);

            // sum next group
            const nextGroupSum = this.sumGroup(depthArray, i, windowLength);

            if (nextGroupSum > previousGroupSum) {
                increasingDepthsNum++;
            }
        }

        return increasingDepthsNum;
    }

    /**
     * DAY 1 - Part 1 & 2
     * Sum a group of integers based on a window length
     */
    static sumGroup(depthArray, startIndex, windowLength) {
        let sum = 0;
        let i = 0;
        do {
            sum += depthArray[startIndex];
            startIndex++;
            i++;
        } while (i < windowLength);
        return sum;
    }

    /**
     * DAY 2 - Part 1
     * Sum forward and down directions then multiply them for a single number
     */
    static multiplyDirections(directionsArray) {
        const forwardRegex = /forward (\d)/;
        const downRegex = /down (\d)/;
        const upRegex = /up (\d)/;

        let forwardSum = 0;
        let downSum = 0;
        let aim = 0;

        directionsArray.forEach((direction) => {
            let match;
            if (match = forwardRegex.exec(direction)) {
                forwardSum += parseInt(match[1]);
                downSum += aim * match[1];
            }
            else if (match = downRegex.exec(direction)) {
                aim += parseInt(match[1]);
            }
            else if (match = upRegex.exec(direction)) {
                aim -= parseInt(match[1]);
            }
        });

        return forwardSum * downSum;
    }

    /**
     * DAY 3 - Diagnostics
     */
    static getPowerConsumption(diagArray) {
        const bitPositions = [];
        let gamma = '';
        let epsilon = '';

        // Initialize the bit counter
        for (let i = 0; i < 12; ++i) {
            bitPositions.push({
                '1': 0,
                '0': 0,
            });
        }

        // count the bits
        diagArray.forEach((data) => {
            console.info(data);
            for (let i = 0; i < 12; ++i) {
                bitPositions[i][data[i]]++;
            }
        });

        // calculate gamma and epsilon
        for (let i = 0; i < 12; ++i) {
            if (bitPositions[i]['1'] > bitPositions[i]['0']) {
                gamma += '1';
                epsilon += '0';
            }
            else {
                gamma += '0';
                epsilon += '1';
            }
        }

        const gammaInt = parseInt(gamma, 2);
        const epsilonInt = parseInt(epsilon, 2);
        console.info('gamma', gamma, gammaInt);
        console.info('epsilon', epsilon, epsilonInt);
        console.info('power consumption', gammaInt * epsilonInt);

        return gammaInt * epsilonInt;
    }
}
