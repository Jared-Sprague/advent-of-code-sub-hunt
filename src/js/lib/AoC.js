// noinspection JSSuspiciousNameCombination

import _ from './lodash.min.js';
import config from '../config';
import DigitDisplay from './DigitDisplay';
import HeightNode from './HeightNode';
import OctoNode from './OctoNode';

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

    // DAY 7
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

    // DAY 9
    static day9(input) {
        input = input.trim();
        const lines = input.split('\n');
        this.heightMesh = [];
        let riskLevelPart1 = 0;
        const basins = {};

        // Build the Height Mesh
        for (const [i, line] of lines.entries()) {
            const heights = line.split('');
            this.heightMesh.push([]);

            for (let [j, height] of heights.entries()) {
                height = parseInt(height);
                const nodeId = `${i}-${j}`;
                const heightNode = new HeightNode(height, nodeId);

                if (i === 0 && j > 0) {
                    // create left/right relationship with previous height node
                    const previousNode = this.heightMesh[i][j - 1];
                    heightNode.neighborLeft.height = previousNode.height;
                    heightNode.neighborLeft.nodeId = previousNode.nodeId;
                    previousNode.neighborRight.height = height;
                    previousNode.neighborRight.nodeId = nodeId;
                }
                else if (i > 0 && j === 0) {
                    // only add neighbor UP
                    const nodeUp = this.heightMesh[i - 1][j];
                    heightNode.neighborUp.height = nodeUp.height;
                    heightNode.neighborUp.nodeId = nodeUp.nodeId;
                    nodeUp.neighborDown.height = height;
                    nodeUp.neighborDown.nodeId = nodeId;
                }
                else if (i > 0 && j > 0) {
                    // Add up/down/left/right relationships
                    const nodeUp = this.heightMesh[i - 1][j];
                    const previousNode = this.heightMesh[i][j - 1];
                    heightNode.neighborLeft.height = previousNode.height;
                    heightNode.neighborLeft.nodeId = previousNode.nodeId;
                    previousNode.neighborRight.height = height;
                    previousNode.neighborRight.nodeId = nodeId;
                    heightNode.neighborUp.height = nodeUp.height;
                    heightNode.neighborUp.nodeId = nodeUp.nodeId;
                    nodeUp.neighborDown.height = height;
                    nodeUp.neighborDown.nodeId = nodeId;
                }

                this.heightMesh[i].push(heightNode);
            }
        }


        // Part 1
        for (const nodes of this.heightMesh) {
            for (const node of nodes) {
                if (node.isLowerThanNeighbors()) {
                    consola.info('lowest point:', node.height);
                    riskLevelPart1 += node.height + 1;
                }
            }
        }

        consola.info('[DAY 9-1] Risk level:', riskLevelPart1);

        // Part 2
        for (const nodes of this.heightMesh) {
            for (const node of nodes) {
                node.basinId = this.findBasinId(node.nodeId);
                if (node.basinId && !basins[node.basinId]) {
                    basins[node.basinId] = 1;
                }
                else if (node.basinId) {
                    basins[node.basinId]++;
                }
            }
        }

        // Multiply the largest 3 basins together to get the answer
        const basinsArray = Object.values(basins).sort((a, b) => a - b).reverse();
        const answerPart2 = basinsArray[0] * basinsArray[1] * basinsArray[2];

        consola.info('[DAY 9-2] Basins answer:', answerPart2);

        return { riskLevelPart1: riskLevelPart1, answerPart2: answerPart2 };
    }

    /**
     * Recursively follow the flow to the nearest basin
     */
    static findBasinId(nodeId) {
        const idPair = nodeId.split('-');
        const node = this.heightMesh[idPair[0]][idPair[1]];

        if (node.height === 9) {
            return null;
        }
        else if (node.isLowerThanNeighbors() || node.basinId) {
            return node.basinId;
        }
        else {
            // recursively follow the flow
            const lowestNodeId = node.getLowestNeighborNodeId();
            return this.findBasinId(lowestNodeId);
        }
    }

    static generateDay9HTML(input) {
        input = input.trim();
        const lines = input.split('\n');
        let outputHTML = `
            <html lang="">
            <head title="fillUP">
                <style>
                    .filled {
                        color: red;
                    }
                    .unfilled {
                        color: blue;
                    }
                    p { margin:0 }
                </style>
            </head>
            <body>
        `;

        // generate HTML
        for (const [i, line] of lines.entries()) {
            const heights = line.split('');

            outputHTML += `
<p>`;
            for (let [j, height] of heights.entries()) {
                const nodeId = `${i}-${j}`;
                height = parseInt(height);

                outputHTML += `<span id="${nodeId}" class="unfilled">${height}</span>
`;
            }
            outputHTML += `</p>
`;
        }

        outputHTML += '</body></html>';
        consola.log('output length:', outputHTML);
    }

    static generateDay11HTML(input) {
        input = input.trim();
        const lines = input.split('\n');
        let outputHTML = `
            <html lang="">
            <head title="OctoFlash!">
                <style>
                    .flash {
                        color: white;
                        background: yellow;
                    }
                    .normal {
                        color: white;
                        background: #292929;
                    }
                    p { margin:0 }
                    span { margin:0 }
                </style>
            </head>
            <body>
        `;

        // generate HTML
        for (const [i, line] of lines.entries()) {
            const powers = line.split('');

            outputHTML += `
<p>`;
            for (let [j, power] of powers.entries()) {
                const nodeId = `${i}-${j}`;
                power = parseInt(power);

                outputHTML += `<span id="${nodeId}" class="unfilled">${power}</span>
`;
            }
            outputHTML += `</p>
`;
        }

        outputHTML += '</body></html>';
        consola.log('output length:', outputHTML);
    }

    // DAY 10
    static day10(input) {
        input = input.trim();
        const lines = input.split('\n');
        const part1PointsValues = { ')': 3, ']': 57, '}': 1197, '>': 25137 };
        const part2PointsValues = { ')': 1, ']': 2, '}': 3, '>': 4 };
        let part1Points = 0;
        const validLines = [];
        const invalidCharsFound = [];
        const completedParts = [];
        const part2Points = [];

        // Part 1
        for (const line of lines) {
            const chunkData = this.findChunkReverse(line);
            if (chunkData.isValid) {
                validLines.push(line);
            }
            else {
                invalidCharsFound.push(chunkData.invalidCharsFound);
            }
        }

        // sum invalid points
        for (const invalidChar of invalidCharsFound) {
            part1Points += part1PointsValues[invalidChar];
        }

        consola.info('[Day 10-1] points:', part1Points);

        // part 2
        for (const line of validLines) {
            const incompletePart = this.clearCompleteChunks(line);
            const completed = this.mirror(incompletePart);
            completedParts.push(completed);
            consola.info('Completed line:', incompletePart, completed);
        }

        // Sum points for part 2
        for (const completedChars of completedParts) {
            let points = 0;
            for (const char of completedChars) {
                points *= 5;
                points += part2PointsValues[char];
            }
            part2Points.push(points);
        }
        part2Points.sort((a, b) => a - b);
        const medianIndex = (part2Points.length - 1) / 2;

        console.info('[DAY 10-2] points:', part2Points[medianIndex]);

        return { part1Points: part1Points, part2Points: part2Points[medianIndex] };
    }

    static clearCompleteChunks(line) {
        const closingCharsRegEx = /[\)\]\}\>]/;
        if (!closingCharsRegEx.exec(line)) {
            return line;
        }
        else {
            // remove next chunk and run again recursively
            const chunkData = this.findChunkReverse(line, false);
            const lineStripped = line.replace(chunkData.chunk, '');
            return this.clearCompleteChunks(lineStripped);
        }
    }

    static findChunkReverse(line, global = true) {
        const closingCharacters = ')]}>';
        const openingCharacters = '([{<';
        const charArray = line.split('');
        let isValid = true;
        const chunkCharacters = [];
        const invalidCharsFound = [];

        for (const [i, char] of charArray.entries()) {
            if (closingCharacters.includes(char)) {
                let numOpening = 0;
                let numClosing = 1;
                let numThisCharClosing = 1;
                let numThisCharOpening = 0;
                let j = i - 1;

                const firstBackChar = charArray[j];
                if (firstBackChar === this.invertSingle(char)) {
                    numOpening++;
                    numThisCharOpening++;
                }
                chunkCharacters.unshift(firstBackChar, char);


                while (j >= 0 && numOpening !== numClosing && numThisCharOpening !== numThisCharClosing) {
                    const backChar = charArray[j];
                    chunkCharacters.unshift(backChar);
                    if (openingCharacters.includes(backChar)) {
                        numOpening++;
                        if (backChar === this.invertSingle(char)) {
                            numThisCharOpening++;
                        }
                    }
                    else if (closingCharacters.includes(backChar)) {
                        numClosing++;
                        if (backChar === char) {
                            numThisCharClosing++;
                        }
                    }
                    j--;
                }

                if (numOpening !== numClosing || numThisCharOpening !== numThisCharClosing) {
                    consola.info('found invalid line:', line, ' invalid char:', char);
                    invalidCharsFound.push(char);
                    isValid = false;
                    break;
                }
                else if (!global) {
                    // return first chunk match
                    return { isValid: isValid, chunk: chunkCharacters.join('') };
                }
            }
        }

        return { isValid: isValid, chunk: chunkCharacters.join(''), invalidCharsFound: invalidCharsFound };
    }

    static mirror(string) {
        const mirroredChars = [];

        for (const char of string) {
            mirroredChars.unshift(this.invertSingle(char));
        }

        return mirroredChars.join('');
    }

    static invertSingle(char) {
        switch (char) {
            case ')':
                return '(';
            case ']':
                return '[';
            case '}':
                return '{';
            case '>':
                return '<';
            case '(':
                return ')';
            case '[':
                return ']';
            case '{':
                return '}';
            case '<':
                return '>';
        }
    }

    // DAY 11
    static day11(input) {
        const lines = input.trim().split('\n');
        // build the same graph as with basins, but add diagonal
        this.octoMesh = [];
        const STEPS_NUM = 500;

        // Build the Height Mesh
        for (const [i, line] of lines.entries()) {
            const powers = line.split('');
            this.octoMesh.push([]);

            for (let [j, power] of powers.entries()) {
                power = parseInt(power);
                const nodeId = `${i}-${j}`;
                const octoNode = new OctoNode(power, nodeId);

                if (i === 0 && j > 0) {
                    // create left/right relationship with previous height node
                    const previousNode = this.octoMesh[i][j - 1];
                    octoNode.neighborLeft.power = previousNode.power;
                    octoNode.neighborLeft.nodeId = previousNode.nodeId;
                    previousNode.neighborRight.power = power;
                    previousNode.neighborRight.nodeId = nodeId;
                }
                else if (i > 0 && j === 0) {
                    // only add neighbor UP
                    const nodeUp = this.octoMesh[i - 1][j];
                    octoNode.neighborUp.power = nodeUp.power;
                    octoNode.neighborUp.nodeId = nodeUp.nodeId;
                    nodeUp.neighborDown.power = power;
                    nodeUp.neighborDown.nodeId = nodeId;

                    // add neighbor UP and Right diagonal relationship
                    const nodeUpRight = this.octoMesh[i - 1][j + 1];
                    octoNode.neighborUpRight.power = nodeUpRight.power;
                    octoNode.neighborUpRight.nodeId = nodeUpRight.nodeId;
                    nodeUpRight.neighborDownLeft.power = power;
                    nodeUpRight.neighborDownLeft.nodeId = nodeId;
                }
                else if (i > 0 && j > 0) {
                    // Add up/down/left/right relationships
                    const nodeUp = this.octoMesh[i - 1][j];
                    const previousNode = this.octoMesh[i][j - 1];
                    octoNode.neighborLeft.power = previousNode.power;
                    octoNode.neighborLeft.nodeId = previousNode.nodeId;
                    previousNode.neighborRight.power = power;
                    previousNode.neighborRight.nodeId = nodeId;
                    octoNode.neighborUp.power = nodeUp.power;
                    octoNode.neighborUp.nodeId = nodeUp.nodeId;
                    nodeUp.neighborDown.power = power;
                    nodeUp.neighborDown.nodeId = nodeId;

                    // Add UP-Left
                    const nodeUpLeft = this.octoMesh[i - 1][j - 1];
                    octoNode.neighborUpLeft.power = nodeUpLeft.power;
                    octoNode.neighborUpLeft.nodeId = nodeUpLeft.nodeId;
                    nodeUpLeft.neighborDownRight.power = power;
                    nodeUpLeft.neighborDownRight.nodeId = nodeId;


                    // only add UP-Right if we're not at the end
                    if (j < powers.length - 1) {
                        const nodeUpRight = this.octoMesh[i - 1][j + 1];
                        octoNode.neighborUpRight.power = nodeUpRight.power;
                        octoNode.neighborUpRight.nodeId = nodeUpRight.nodeId;
                        nodeUpRight.neighborDownLeft.power = power;
                        nodeUpRight.neighborDownLeft.nodeId = nodeId;
                    }
                }

                this.octoMesh[i].push(octoNode);
            }
        }

        // now that the mesh is built simulate the steps
        for (let i = 0; i < STEPS_NUM; ++i) {
            // Increment step
            for (const nodes of this.octoMesh) {
                for (const node of nodes) {
                    // first part of the step is to increment all by 1;
                    node.stepNum++;
                    node.power++;
                }
            }

            // now check for flashes and cascades
            for (const nodes of this.octoMesh) {
                for (const node of nodes) {
                    node.nextStep(this.octoMesh);
                }
            }

            // part 2 - check if all Octo's flashed during this step
            let numFlashedInStep = 0;
            for (const nodes of this.octoMesh) {
                for (const node of nodes) {
                    if (node.flashedThisStep()) {
                        numFlashedInStep += 1;
                    }
                }
            }

            if (numFlashedInStep === 100) {
                consola.info('Step where all flashed: ', i + 1);
                break;
            }
        }

        // Part 1 - sum total flashes
        let totalFlashes = 0;
        for (const nodes of this.octoMesh) {
            for (const node of nodes) {
                totalFlashes += node.totalFlashes;
            }
        }

        consola.info('After', STEPS_NUM, 'steps, total flashes:', totalFlashes);
    }

    // DAY 12
    static day12(input) {
        // const lines = input.trim().split('\n');
        //
        // consola.info('Day 12');
    }

    // DAY 13
    static day13(input) {
        const lines = input.trim().split('\n');
        const dotsRaw = [];
        const regEx = /fold along ([xy])=(\d+)/;
        const folds = [];
        let maxY = 0;
        let maxX = 0;

        // Read in input
        for (const line of lines) {
            const dot = line.split(',');
            const match = regEx.exec(line);

            if (dot && dot.length === 2) {
                const doxX = parseInt(dot[0]);
                const dotY = parseInt(dot[1]);

                if (doxX > maxX) {
                    maxX = doxX;
                }
                if (dotY > maxY) {
                    maxY = dotY;
                }

                dotsRaw.push({ x: doxX, y: dotY });
            }
            else if (match) {
                const axis = match[1];
                const value = parseInt(match[2]);
                const fold = {};
                fold.axis = axis;
                fold.value = value;
                folds.push(fold);
            }
        }

        // Init the grid
        const dots = new Array(maxY + 1).fill(0).map(() => new Array(maxX + 1).fill(0));
        for (const dot of dotsRaw) {
            dots[dot.y][dot.x] = 1;
        }

        // Do the folds
        let currentGrid = _.clone(dots);
        for (const fold of folds) {
            if (fold.axis === 'y') {
                // fold up
                const slicedDotsBottom = currentGrid.slice(fold.value + 1);
                const slicedDotsTop = currentGrid.slice(0, fold.value);
                const mirrorUp = this.mirrorArray(slicedDotsBottom, fold.axis);
                this.mergeArrays(slicedDotsTop, mirrorUp);
                currentGrid = _.clone(slicedDotsTop);
            }
            else if (fold.axis === 'x') {
                // fold left
                const slicedDotsRight = [];
                const slicedDotsLeft = [];
                for (const row of currentGrid) {
                    slicedDotsRight.push(row.slice(fold.value + 1));
                    slicedDotsLeft.push(row.slice(0, fold.value));
                }
                const mirrorLeft = this.mirrorArray(slicedDotsRight, fold.axis);
                this.mergeArrays(slicedDotsLeft, mirrorLeft);
                currentGrid = _.clone(slicedDotsLeft);
            }

            consola.info('Dots after fold ', fold, ' dot count:', this.countDots(currentGrid));
        }
    }

    static countDots(grid) {
        let dotCount = 0;
        for (const row of grid) {
            for (const element of row) {
                if (element > 0) {
                    dotCount++;
                }
            }
        }
        return dotCount;
    }

    static mergeArrays(arrayA, arrayB) {
        const xLength = arrayA[0].length;

        // copy in folded values
        for (let i = 0; i < arrayA.length; ++i) {
            for (let j = 0; j < xLength; ++j) {
                if (arrayB[i][j] > 0) {
                    arrayA[i][j] = arrayB[i][j];
                }
            }
        }

        return arrayA;
    }

    static mirrorArray(arrayElements, axis) {
        if (axis === 'y') {
            return arrayElements.reverse();
        }
        else if (axis === 'x') {
            const reversedX = [];
            for (const row of arrayElements) {
                reversedX.push(row.reverse());
            }
            return reversedX;
        }
    }

    // DAY 14
    static day14(input) {
        const lines = input.trim().split('\n');
        const regEx = /(\w\w) -> (\w)/;
        const insertionRules = {};
        const polymerTemplate = lines[0];
        const NUM_STEPS = 40;
        const elementCount = {};
        let currentPairCount = {};
        const firstElement = polymerTemplate[0];

        // load input
        for (const line of lines) {
            const match = regEx.exec(line);

            if (match) {
                insertionRules[match[1]] = match[2];
                currentPairCount[match[1]] = 0;
            }
        }

        // Initial pair count
        for (let j = 0; j < polymerTemplate.length - 1; ++j) {
            const pair = polymerTemplate[j] + polymerTemplate[j + 1];
            currentPairCount[pair]++;
        }

        for (let i = 0; i < NUM_STEPS; ++i) {
            consola.log('Day 14 Step:', i);

            const newPairCount = {};

            for (const pair in currentPairCount) {
                if (Object.prototype.hasOwnProperty.call(currentPairCount, pair)) {
                    const count = currentPairCount[pair];
                    if (count > 0) {
                        const insertElement = insertionRules[pair];
                        const newPair1 = pair[0] + insertElement;
                        const newPair2 = insertElement + pair[1];

                        // count the new pairs
                        if (newPairCount[newPair1]) {
                            newPairCount[newPair1] += count;
                        }
                        else {
                            newPairCount[newPair1] = count;
                        }

                        if (newPairCount[newPair2]) {
                            newPairCount[newPair2] += count;
                        }
                        else {
                            newPairCount[newPair2] = count;
                        }
                    }
                }
            }

            currentPairCount = _.clone(newPairCount);
        }

        // count elements
        consola.log('Day 14 - counting elements');
        for (const pair in currentPairCount) {
            if (Object.prototype.hasOwnProperty.call(currentPairCount, pair)) {
                const element = pair[1];
                if (elementCount[element]) {
                    elementCount[element] += currentPairCount[pair];
                }
                else {
                    elementCount[element] = currentPairCount[pair];
                }
            }
        }
        elementCount[firstElement]++;

        const countsSortable = [];
        for (const element in elementCount) {
            if (Object.prototype.hasOwnProperty.call(elementCount, element)) {
                countsSortable.push([element, elementCount[element]]);
            }
        }
        countsSortable.sort(function(a, b) {
            return a[1] - b[1];
        });
        const topElement = _.last(countsSortable);
        const leastElement = countsSortable[0];

        consola.info('Day 14 part 1 answer:', topElement[1] - leastElement[1]);
    }
}
