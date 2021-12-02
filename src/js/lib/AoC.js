export default class AoC {

    /**
     * Day 1 - 1 puzzle to get the number of increasing depths
     * https://adventofcode.com/2021/day/1
     */
    static getIncreasingDepthsNum(depthArray, windowLength) {
        let increasingDepthsNum = 0;
        const windowLengthOffset = windowLength - 1;

        for (let i = 1; i < depthArray.length - windowLengthOffset; ++i) {
            let previousGroupSum = 0;
            let nextGroupSum = 0;

            // sum previous group
            previousGroupSum = this.sumGroup(depthArray, i - 1, windowLength);

            // sum next group
            nextGroupSum = this.sumGroup(depthArray, i, windowLength);

            if (nextGroupSum > previousGroupSum) {
                console.log(nextGroupSum + ' > ' + previousGroupSum + ' Increasing');
                increasingDepthsNum++;
            }
        }

        return increasingDepthsNum;
    }

    static sumGroup(depthArray, startIndex, windowLength) {
        let sum = 0;
        let i = 0;
        // let logString = 'Start Index: ' + startIndex + ' Window Length: ' + windowLength + ' Elements in window: ';
        do {
            sum += depthArray[startIndex];
            // logString += depthArray[startIndex] + '+ ';

            startIndex++;
            i++;
        } while (i < windowLength);

        // console.log(logString + ' = ' + sum);

        return sum;
    }
}
