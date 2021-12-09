import _ from './lodash.min.js';
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

        consola.info('[DAY 1] Increasing depths:', increasingDepthsNum);

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

        const directionsSum = forwardSum * downSum;
        consola.info('[DAY 2-2] Directions sum:', directionsSum);
        return directionsSum;
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
        consola.info('[DAY 3] power consumption', gammaInt * epsilonInt);

        return gammaInt * epsilonInt;
    }

    /**
     * DAY 3 - Get the life support rating by multiplying Oxygen and CO2 ratings
     */
    static getLifeSupportRating(diagArray, bitPositions) {
        const oxygenRating = this.filterData(diagArray, 0);
        const co2Rating = this.filterData(diagArray, 0, true);
        const lifeSupportRating = parseInt(oxygenRating[0], 2) * parseInt(co2Rating[0], 2);
        consola.info('[DAY 3] Life support rating:', lifeSupportRating);
        return lifeSupportRating;
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

    /**
     * DAY 4 - Play Bingo against a squid!
     */
    static playBingo(boardsArray) {
        const numbers = '57,9,8,30,40,62,24,70,54,73,12,3,71,95,58,88,23,81,53,80,22,45,98,37,18,72,14,20,66,0,19,31,' +
            '82,34,55,29,27,96,48,28,87,83,36,26,63,21,5,46,33,86,32,56,6,38,52,16,41,74,99,77,13,35,65,4,78,91,90,43,' +
            '1,2,64,60,94,85,61,84,42,76,68,10,49,89,11,17,79,69,39,50,25,51,47,93,44,92,59,75,7,97,67,15';
        const numbersArray = numbers.split(',');
        const firstLastBoard = {};
        const boardObjects = [];

        // initialize boards
        boardsArray.forEach((board) => {
            boardObjects.push({
                rowTally: {
                    '0': 0,
                    '1': 0,
                    '2': 0,
                    '3': 0,
                    '4': 0,
                },
                colTally: {
                    '0': 0,
                    '1': 0,
                    '2': 0,
                    '3': 0,
                    '4': 0,
                },
                boardGrid    : board,
                markedNumbers: [],
            });
        });

        const winningBoards = [];

        for (let i = 0; i < numbersArray.length; ++i) {
            const number = parseInt(numbersArray[i]);

            if (winningBoards.length < 100) {
                boardObjects.forEach((board, index) => {
                    // search the board for any occurrence of that number
                    for (let j = 0; j < board.boardGrid.length; ++j) {
                        for (let k = 0; k < 5; ++k) {
                            if (board.boardGrid[j][k] === number) {
                                // consola.info('board:', index, 'matched:', number, 'row:', j, 'col:', k);
                                board.rowTally[j]++;
                                board.colTally[k]++;
                                board.markedNumbers.push(number);

                                if (board.rowTally[j] === 5 || board.colTally[k] === 5) {
                                    if (!winningBoards.includes(index)) {
                                        // Add to winning boards
                                        const sumUnmarked = this.sumUnmarkedNumbers(board);
                                        winningBoards.push(index);
                                        if (winningBoards.length === 1) {
                                            firstLastBoard.first = sumUnmarked * number;
                                            consola.info('[DAY 4] FIRST BINGO! board:', index, 'sum:', sumUnmarked, 'number:', number, 'winning code:', firstLastBoard.first);
                                        }
                                        else if (winningBoards.length === 100) {
                                            firstLastBoard.last = sumUnmarked * number;
                                            consola.info('[DAY 4] LAST BINGO! board:', index, 'sum:', sumUnmarked, 'number:', number, 'winning code:', firstLastBoard.last);
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        if (winningBoards.length === 100) {
                            break;
                        }
                    }
                });
            }
        }

        consola.info('num bingo boards:', boardsArray.length);

        return firstLastBoard;
    }

    static sumUnmarkedNumbers(board) {
        let unmarkedSum = 0;
        for (let i = 0; i < 5; ++i) {
            for (let j = 0; j < 5; ++j) {
                if (!board.markedNumbers.includes(board.boardGrid[i][j])) {
                    unmarkedSum += board.boardGrid[i][j];
                }
            }
        }
        return unmarkedSum;
    }

    // DAY 5 - Counting line intersects
    static getLineIntersects(lines, includeDiagonal = false) {
        this.pointCounter = {};
        const linesArray = [];
        const pointsRegex = /(\d+,\d+) -> (\d+,\d+)/;
        let match;
        let totalIntersectingCount = 0;

        // Parse the input
        lines.split('\n').forEach((line) => {
            if (match = pointsRegex.exec(line)) {
                const point1 = match[1].split(',');
                const point2 = match[2].split(',');
                linesArray.push({
                    x1: parseInt(point1[0]),
                    y1: parseInt(point1[1]),
                    x2: parseInt(point2[0]),
                    y2: parseInt(point2[1]),
                });
            }
        });

        // Iterate over lines and increment point intersects
        linesArray.forEach((line) => {
            // only consider horizontal and vertical
            if ((line.x1 === line.x2 || line.y1 === line.y2) || includeDiagonal) {
                let axis;
                let staticValue;
                let deltaStart;
                let deltaEnd;
                let delta;

                if (line.x1 === line.x2) {
                    axis = 'y';
                    staticValue = line.x1;
                    if (line.y1 < line.y2) {
                        deltaStart = line.y1;
                        deltaEnd = line.y2;
                    }
                    else {
                        deltaStart = line.y2;
                        deltaEnd = line.y1;
                    }
                }
                else if (line.y1 === line.y2) {
                    axis = 'x';
                    staticValue = line.y1;
                    if (line.x1 < line.x2) {
                        deltaStart = line.x1;
                        deltaEnd = line.x2;
                    }
                    else {
                        deltaStart = line.x2;
                        deltaEnd = line.x1;
                    }
                }
                else {
                    axis = 'x,y';
                    if (line.x1 < line.x2) {
                        delta = line.x2 - line.x1;
                    }
                    else {
                        delta = line.x1 - line.x2;
                    }
                }

                // Now calculate the line points and increment the counter
                if (axis !== 'x,y') {
                    for (let i = deltaStart; i <= deltaEnd; ++i) {
                        if (axis === 'y') {
                            const pointKey = '' + staticValue + ',' + i;
                            this.incrementPointCounter(pointKey);
                        }
                        else {
                            const pointKey = '' + i + ',' + staticValue;
                            this.incrementPointCounter(pointKey);
                        }
                    }
                }

                // count diagonal lines
                if (includeDiagonal) {
                    for (let i = 0; i <= delta; ++i) {
                        let x;
                        let y;
                        if (line.x1 < line.x2) {
                            x = line.x1 + i;
                        }
                        else {
                            x = line.x1 - i;
                        }
                        if (line.y1 < line.y2) {
                            y = line.y1 + i;
                        }
                        else {
                            y = line.y1 - i;
                        }
                        const pointKey = '' + x + ',' + y;
                        this.incrementPointCounter(pointKey);
                    }
                }
            }
        });

        // Now count how many points overlap
        for (const point in this.pointCounter) {
            if (this.pointCounter[point] > 1) {
                totalIntersectingCount++;
            }
        }

        consola.info('num point groups:', linesArray.length);
        consola.info('num line points total:', Object.getOwnPropertyNames(this.pointCounter).length);
        consola.info('[DAY 5] total intersecting points:', totalIntersectingCount);

        return totalIntersectingCount;
    }

    static incrementPointCounter(pointKey) {
        if (this.pointCounter[pointKey]) {
            this.pointCounter[pointKey]++;
        }
        else {
            this.pointCounter[pointKey] = 1;
        }
    }

    static getFishNum(initialInput, days) {
        const initialArray = initialInput.split(',');
        const fishDaysArray = new Array(9);
        fishDaysArray.fill(0);

        initialArray.forEach((daysToNextSpawn) => {
            fishDaysArray[parseInt(daysToNextSpawn)]++;
        });

        for (let i = 0; i < days; ++i) {
            const newSpawnsCount = fishDaysArray.shift();
            fishDaysArray.push(newSpawnsCount);
            fishDaysArray[6] += newSpawnsCount;
        }

        return _.sum(fishDaysArray);
    }

    static getLeastFuel(crabPositions, part1 = true) {
        let leastFuel = Infinity;
        let optimalPosition;
        const crabArray = crabPositions.split(',');

        for (let i = 0; i < crabArray.length; ++i) {
            crabArray[i] = parseInt(crabArray[i]);
        }

        crabArray.sort((a, b) => a - b);

        const minPosition = crabArray[0];
        const maxPosition = crabArray[crabArray.length - 1];

        for (let i = minPosition; i < maxPosition; ++i) {
            const fuelNeeded = this.getFuelNeededAtPosition(i, crabArray, part1);
            if (fuelNeeded < leastFuel) {
                leastFuel = fuelNeeded;
                optimalPosition = i;
            }
        }

        consola.info('Least fuel used:', leastFuel, ' at position:', optimalPosition);

        return leastFuel;
    }

    static getFuelNeededAtPosition(position, crabArray, part1) {
        let fuelNeeded = 0;

        for (let i = 0; i < crabArray.length; ++i) {
            fuelNeeded += this.calculateExtraFuel(Math.abs(crabArray[i] - position), part1);
        }

        return fuelNeeded;
    }

    static calculateExtraFuel(positionsToMove, part1) {
        if (part1) {
            return positionsToMove;
        }

        let totalFuel = 0;
        let previousStepCost = 0;
        let currentStepCost = 0;

        for (let i = 1; i <= positionsToMove; ++i) {
            currentStepCost = previousStepCost + 1;
            totalFuel += currentStepCost;
            previousStepCost = currentStepCost;
        }

        return totalFuel;
    }

    // DAY 8
    static day8(input) {
        input = input.trim();
        const lines = input.split('\n');
        let totalUniqueOutputDigits = 0;
        const digitDisplay = new DigitDisplay();
        let sumOutputValues = 0;

        lines.forEach((line) => {
            const pair = line.split('|');
            const tenDigits = pair[0].trim().split(' ');
            const outputDigits = pair[1].trim().split(' ');
            const sixCharacterDigits = [];
            let outputValue = '';

            // sort the ten digit array by string length so we can process it from shortest to longest sequence
            tenDigits.sort((a, b) => a.length - b.length);

            tenDigits.forEach((digit) => {
                switch (digit.length) {
                    case 2: // 1 digit
                        digitDisplay.set1(digit);
                        break;
                    case 3: // 7 digit
                        digitDisplay.set7(digit);
                        break;
                    case 4: // 4 digit
                        digitDisplay.set4(digit);
                        break;
                    case 6: // 0, 6, 9
                        sixCharacterDigits.push(digit);
                        break;
                    case 7: // 8 digit
                        digitDisplay.set8(digit);
                        break;
                }
            });

            sixCharacterDigits.forEach((digit) => {
                digitDisplay.tuneSixCharacterDigit(digit);
            });

            outputDigits.forEach((digit) => {
                // PART 1
                switch (digit.length) {
                    case 2: // 1 digit
                        totalUniqueOutputDigits++;
                        break;
                    case 4: // 4 digit
                        totalUniqueOutputDigits++;
                        break;
                    case 3: // 7 digit
                        totalUniqueOutputDigits++;
                        break;
                    case 7: // 8 digit
                        totalUniqueOutputDigits++;
                        break;
                }

                outputValue += digitDisplay.decode(digit);
            });
            sumOutputValues += parseInt(outputValue);
        });

        consola.info('Total unique output digits: ', totalUniqueOutputDigits, ' Total output value: ', sumOutputValues);

        return ({ totalUnique: totalUniqueOutputDigits, outputSum: sumOutputValues });
    }
}

class DigitDisplay {
    constructor() {
        // Init
        this.segmentMap = {
            a: null,
            b: null,
            c: null,
            d: null,
            e: null,
            f: null,
            g: null,
        };

        this.intCache = {};
    }

    /**
     * Assigns the digit 1 sequence characters to the default map, the 'cf' part
     * @param sequence random 2 character sequence
     */
    set1(sequence) {
        this.segmentMap.c = sequence[0];
        this.segmentMap.f = sequence[1];
    }

    /**
     * Assigns the digit 4 sequence characters to the default map not including the 1 characters, the 'bd' part
     * @param sequence random 4 character sequence
     */
    set4(sequence) {
        const bd = this.removeCharactersFromString(sequence, this.get1());
        this.segmentMap.b = bd[0];
        this.segmentMap.d = bd[1];
    }

    /**
     * Assigns the digit 7 sequence characters to the default map not including the 1 characters, the 'a' part
     * @param sequence random 3 character sequence
     */
    set7(sequence) {
        this.segmentMap.a = this.removeCharactersFromString(sequence, this.get1());
    }

    /**
     * Assigns the digit 8 sequence characters to the default map not including the 1.4,7 characters, the 'eg' part
     * @param sequence random 7 character sequence
     */
    set8(sequence) {
        const charactersToRemove = this.get1() + this.get4() + this.get7();
        const eg = this.removeCharactersFromString(sequence, charactersToRemove);
        this.segmentMap.e = eg[0];
        this.segmentMap.g = eg[1];
    }

    get0() {
        const zero = this.segmentMap.a +
            this.segmentMap.b +
            this.segmentMap.c +
            this.segmentMap.e +
            this.segmentMap.f +
            this.segmentMap.g;
        return this.sortAlphabetic(zero);
    }

    get1() {
        const one = this.segmentMap.c +
            this.segmentMap.f;
        return this.sortAlphabetic(one);
    }

    get2() {
        const two = this.segmentMap.a +
            this.segmentMap.c +
            this.segmentMap.d +
            this.segmentMap.e +
            this.segmentMap.g;
        return this.sortAlphabetic(two);
    }

    get3() {
        const three = this.segmentMap.a +
            this.segmentMap.c +
            this.segmentMap.d +
            this.segmentMap.f +
            this.segmentMap.g;
        return this.sortAlphabetic(three);
    }

    get4() {
        const four = this.segmentMap.b +
            this.segmentMap.c +
            this.segmentMap.d +
            this.segmentMap.f;
        return this.sortAlphabetic(four);
    }

    get5() {
        const five = this.segmentMap.a +
            this.segmentMap.b +
            this.segmentMap.d +
            this.segmentMap.f +
            this.segmentMap.g;
        return this.sortAlphabetic(five);
    }

    get6() {
        const six = this.segmentMap.a +
            this.segmentMap.b +
            this.segmentMap.d +
            this.segmentMap.e +
            this.segmentMap.f +
            this.segmentMap.g;
        return this.sortAlphabetic(six);
    }

    get7() {
        const seven = this.segmentMap.a +
            this.segmentMap.c +
            this.segmentMap.f;
        return this.sortAlphabetic(seven);
    }

    get8() {
        const eight = this.segmentMap.a +
            this.segmentMap.b +
            this.segmentMap.c +
            this.segmentMap.d +
            this.segmentMap.e +
            this.segmentMap.f +
            this.segmentMap.g;
        return this.sortAlphabetic(eight);
    }

    get9() {
        const nine = this.segmentMap.a +
            this.segmentMap.b +
            this.segmentMap.c +
            this.segmentMap.d +
            this.segmentMap.f +
            this.segmentMap.g;
        return this.sortAlphabetic(nine);
    }

    /**
     * Tune the sequence map from a 6 character digit string which only include the numbers 0 and 6,
     * based on this we can lock-in all but the other digits except the number 5 which we're still not sure about,
     * but can easily account for later.
     */
    tuneSixCharacterDigit(sequence) {
        if (sequence.length !== 6) {
            return;
        }

        // sort input alphabetically
        sequence = this.sortAlphabetic(sequence);

        const sequenceTranslated = this.translate(sequence);

        if (sequenceTranslated === 'acdefg') {
            // Invalid zero sequence, need to swap 'bd' segments
            const t = this.segmentMap.b;
            this.segmentMap.b = this.segmentMap.d;
            this.segmentMap.d = t;
        }
        else if (sequenceTranslated === 'abcdeg') {
            // invalid six sequence, need to swap 'cf' segments
            const t = this.segmentMap.c;
            this.segmentMap.c = this.segmentMap.f;
            this.segmentMap.f = t;
        }
        else if (sequenceTranslated === 'abcdef') {
            // Invalid Nine sequence, need to swap 'eg' segments
            const t = this.segmentMap.e;
            this.segmentMap.e = this.segmentMap.g;
            this.segmentMap.g = t;
        }
    }

    /**
     * Removes charaters from stringA that are found in stringB
     * @param stringA string to be modified
     * @param stringB string of characters to be removed from stringA
     * @return {*}
     */
    removeCharactersFromString(stringA, stringB) {
        const pattern = `[${stringB}]`;
        const regEx = new RegExp(pattern, 'g');
        return stringA.replace(regEx, '');
    }

    sortAlphabetic(string) {
        return string.split('').sort().join('');
    }

    translate(sequence) {
        sequence = this.sortAlphabetic(sequence);
        let translatedSequence = '';

        for (const [key, value] of Object.entries(this.segmentMap)) {
            if (sequence.includes(value)) {
                translatedSequence += key;
            }
        }

        return this.sortAlphabetic(translatedSequence);
    }

    generateIntCache() {
        this.intCache[this.get0()] = 0;
        this.intCache[this.get1()] = 1;
        this.intCache[this.get2()] = 2;
        this.intCache[this.get3()] = 3;
        this.intCache[this.get4()] = 4;
        this.intCache[this.get5()] = 5;
        this.intCache[this.get6()] = 6;
        this.intCache[this.get7()] = 7;
        this.intCache[this.get8()] = 8;
        this.intCache[this.get9()] = 9;
    }

    decode(sequence) {
        sequence = this.sortAlphabetic(sequence);
        this.generateIntCache();
        return this.intCache[sequence];
    }
}
