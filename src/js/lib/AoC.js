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

    /**
     * Sum a group of integers based on a window length
     * @param depthArray
     * @param startIndex
     * @param windowLength
     * @return {number}
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
}
