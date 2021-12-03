import _ from './lodash';
import config from '../config';
const consola = require('consola').withTag('AoC');
consola.level = config.LOG_LEVEL;

export const BIT_LENGTH = 12;

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
     * DAY 3 - Get Diagnostic report
     */
    static getDiagnosticReport(diagArray) {
        const powerConsumption = this.getPowerConsumption(diagArray);
        const lifeSupportRating = this.getLifeSupportRating(diagArray);

        return { 'powerConsumption': powerConsumption, 'lifeSupportRating': lifeSupportRating };
    }

    /**
     * DAY 3 - Get the power consumption
     */
    static getPowerConsumption(diagArray) {
        let gamma = '';
        let epsilon = '';

        const bitPositions = this.getBitCount(diagArray);

        // calculate gamma and epsilon
        for (let i = 0; i < BIT_LENGTH; ++i) {
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
        consola.info('gamma', gamma, gammaInt);
        consola.info('epsilon', epsilon, epsilonInt);
        consola.info('power consumption', gammaInt * epsilonInt);

        return gammaInt * epsilonInt;
    }

    /**
     * DAY 3 - Get the life support rating by multiplying Oxygen and CO2 ratings
     */
    static getLifeSupportRating(diagArray, bitPositions) {
        const oxygenRating = this.filterData(diagArray, 0);
        const co2Rating = this.filterData(diagArray, 0, true);
        return parseInt(oxygenRating[0], 2) * parseInt(co2Rating[0], 2);
    }

    /**
     * DAY 3 - Recursively filters an array based on most common bits in each position, until there is only 1 left
     */
    static filterData(diagArray, index, reverse = false) {
        const bitPositions = this.getBitCount(diagArray);

        const resultArray = _.filter(diagArray, (element) => {
            if (!reverse) {
                if (bitPositions[index]['1'] >= bitPositions[index]['0']) {
                    return element[index] === '1';
                }
                else {
                    return element[index] === '0';
                }
            }
            else {
                if (bitPositions[index]['0'] <= bitPositions[index]['1']) {
                    return element[index] === '0';
                }
                else {
                    return element[index] === '1';
                }
            }
        });
        consola.info('num results', resultArray.length);

        if (index >= BIT_LENGTH - 1 || resultArray.length === 1) {
            return resultArray;
        }

        return this.filterData(resultArray, ++index, reverse);
    }

    /**
     * DAY 3 - Count the 1's and 0's in each position
     */
    static getBitCount(diagArray) {
        const bitPositions = [];

        // Initialize the bit counter
        for (let i = 0; i < BIT_LENGTH; ++i) {
            bitPositions.push({
                '1': 0,
                '0': 0,
            });
        }

        // count the bits
        diagArray.forEach((data) => {
            for (let i = 0; i < BIT_LENGTH; ++i) {
                bitPositions[i][data[i]]++;
            }
        });

        return bitPositions;
    }
}
