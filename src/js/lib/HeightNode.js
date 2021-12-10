export default class HeightNode {
    constructor(height, id) {
        this.nodeId = id;
        this.height = height;
        this.basinId = null;
        this.neighborUp = { height: Infinity, nodeId: null };
        this.neighborDown = { height: Infinity, nodeId: null };
        this.neighborLeft = { height: Infinity, nodeId: null };
        this.neighborRight = { height: Infinity, nodeId: null };
    }

    getLowestNeighborNodeId() {
        if (this.isLowerThanNeighbors()) {
            return this.nodeId;
        }
        else {
            let lowestNeighbor = { nodeId: null, height: Infinity };
            if (this.neighborUp.height < lowestNeighbor.height) {
                lowestNeighbor = this.neighborUp;
            }

            if (this.neighborDown.height < lowestNeighbor.height) {
                lowestNeighbor = this.neighborDown;
            }

            if (this.neighborLeft.height < lowestNeighbor.height) {
                lowestNeighbor = this.neighborLeft;
            }

            if (this.neighborRight.height < lowestNeighbor.height) {
                lowestNeighbor = this.neighborRight;
            }

            return lowestNeighbor.nodeId;
        }
    }

    isLowerThanNeighbors() {
        const isLowest = this.height < this.neighborUp.height &&
            this.height < this.neighborDown.height &&
            this.height < this.neighborLeft.height &&
            this.height < this.neighborRight.height;

        if (!this.basinId && isLowest) {
            this.basinId = this.nodeId;
        }

        return isLowest;
    }
}
