export default class AoC {

    /**
     * Day 1 - 1 puzzle to get the number of increasing depths
     * https://adventofcode.com/2021/day/1
     */
    static getIncreasingDepthsNum(depthsArray) {
        let increasingDepthsNum = 0;

        for (let i = 1; i < depthsArray.length; i++) {
            if (depthsArray[i] > depthsArray[i - 1]) {
                increasingDepthsNum++;
            }
        }

        return increasingDepthsNum;
    }
}
