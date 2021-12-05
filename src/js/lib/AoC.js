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

    /**
     * DAY 4 - Play Bingo against a squid!
     */
    static playBingo(boardsArray) {
        const numbers = '57,9,8,30,40,62,24,70,54,73,12,3,71,95,58,88,23,81,53,80,22,45,98,37,18,72,14,20,66,0,19,31,' +
            '82,34,55,29,27,96,48,28,87,83,36,26,63,21,5,46,33,86,32,56,6,38,52,16,41,74,99,77,13,35,65,4,78,91,90,43,' +
            '1,2,64,60,94,85,61,84,42,76,68,10,49,89,11,17,79,69,39,50,25,51,47,93,44,92,59,75,7,97,67,15';
        const numbersArray = numbers.split(',');

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
                                            consola.log('FIRST BINGO! board:', index, 'sum:', sumUnmarked, 'number:', number, 'winning code:', sumUnmarked * number);
                                        }
                                        else if (winningBoards.length === 100) {
                                            consola.log('LAST BINGO! board:', index, 'sum:', sumUnmarked, 'number:', number, 'winning code:', sumUnmarked * number);
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

        return 123;
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

    static getLineIntersects(lines) {
        const pointCounter = {};
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
                    x1: point1[0],
                    y1: point1[1],
                    x2: point2[0],
                    y2: point2[1],
                });
            }
        });

        // Iterate over lines and increment point intersects
        linesArray.forEach((line) => {
            // only consider horizontal and vertical
            if (line.x1 === line.x2 || line.y1 === line.y2) {
                const axis = (line.x1 === line.x2) ? 'y' : 'x';
                let staticValue;
                let deltaStart;
                let deltaEnd;
                if (axis === 'y') {
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
                else {
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

                // Now calculate the line points and increment the counter
                for (let i = deltaStart; i <= deltaEnd; ++i) {
                    if (axis === 'y') {
                        const pointKey = '' + staticValue + ',' + i;
                        if (pointCounter[pointKey]) {
                            pointCounter[pointKey]++;
                        }
                        else {
                            pointCounter[pointKey] = 1;
                        }
                    }
                    else {
                        const pointKey = '' + i + ',' + staticValue;
                        if (pointCounter[pointKey]) {
                            pointCounter[pointKey]++;
                        }
                        else {
                            pointCounter[pointKey] = 1;
                        }
                    }
                }
            }
        });

        // Now count how many points overlap
        for (const point in pointCounter) {
            if (pointCounter[point] > 1) {
                totalIntersectingCount++;
            }
        }

        consola.info('num point groups:', linesArray.length);
        consola.info('num line points total:', Object.getOwnPropertyNames(pointCounter).length);
        consola.info('total intersecting points:', totalIntersectingCount);
    }
}
