export default class OctoNode {
    constructor(power, id) {
        this.nodeId = id;
        this.power = power;
        this.totalFlashes = 0;
        this.stepNum = 0;
        this.lastStepFlashed = -1;

        // up/down/left/right neighbors
        this.neighborUp = { power: Infinity, nodeId: null };
        this.neighborDown = { power: Infinity, nodeId: null };
        this.neighborLeft = { power: Infinity, nodeId: null };
        this.neighborRight = { power: Infinity, nodeId: null };

        // diagonals
        this.neighborUpLeft = { power: Infinity, nodeId: null };
        this.neighborUpRight = { power: Infinity, nodeId: null };
        this.neighborDownLeft = { power: Infinity, nodeId: null };
        this.neighborDownRight = { power: Infinity, nodeId: null };
    }

    nextStep(octoMesh) {
        // See if we flash
        this.checkFlash(octoMesh);
    }

    increaseNeighborPower(octoMesh, neighbor) {
        if (neighbor.nodeId) {
            const id = neighbor.nodeId.split('-');
            const row = parseInt(id[0]);
            const col = parseInt(id[1]);
            const neighborNode = octoMesh[row][col];

            if (neighborNode && neighborNode.lastStepFlashed !== neighborNode.stepNum) {
                neighborNode.power++;
                neighborNode.checkFlash(octoMesh);
            }
        }
    }

    checkFlash(octoMesh) {
        if (this.power > 9 && this.lastStepFlashed !== this.stepNum) {
            // console.log('Octo', this.nodeId, ' FLASHED!');
            this.totalFlashes++;
            this.lastStepFlashed = this.stepNum;
            this.power = 0;

            // Increase the power of all neighbors
            this.increaseNeighborPower(octoMesh, this.neighborUp);
            this.increaseNeighborPower(octoMesh, this.neighborDown);
            this.increaseNeighborPower(octoMesh, this.neighborLeft);
            this.increaseNeighborPower(octoMesh, this.neighborRight);
            this.increaseNeighborPower(octoMesh, this.neighborUpLeft);
            this.increaseNeighborPower(octoMesh, this.neighborUpRight);
            this.increaseNeighborPower(octoMesh, this.neighborDownLeft);
            this.increaseNeighborPower(octoMesh, this.neighborDownRight);
        }
    }

    flashedThisStep() {
        return this.lastStepFlashed === this.stepNum;
    }
}
