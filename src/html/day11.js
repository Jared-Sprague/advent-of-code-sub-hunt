// DAY 11

const octoMesh = [];

async function day11(input) {
    const lines = input.trim().split('\n');
    // build the same graph as with basins, but add diagonal

    const STEPS_NUM = 50;

    // Build the Height Mesh
    for (const [i, line] of lines.entries()) {
        const powers = line.split('');
        octoMesh.push([]);

        for (let [j, power] of powers.entries()) {
            power = parseInt(power);
            const nodeId = `${i}-${j}`;
            const octoNode = new OctoNode(power, nodeId);

            if (i === 0 && j > 0) {
                // create left/right relationship with previous height node
                const previousNode = octoMesh[i][j - 1];
                octoNode.neighborLeft.power = previousNode.power;
                octoNode.neighborLeft.nodeId = previousNode.nodeId;
                previousNode.neighborRight.power = power;
                previousNode.neighborRight.nodeId = nodeId;
            }
            else if (i > 0 && j === 0) {
                // only add neighbor UP
                const nodeUp = octoMesh[i - 1][j];
                octoNode.neighborUp.power = nodeUp.power;
                octoNode.neighborUp.nodeId = nodeUp.nodeId;
                nodeUp.neighborDown.power = power;
                nodeUp.neighborDown.nodeId = nodeId;

                // add neighbor UP and Right diagonal relationship
                const nodeUpRight = octoMesh[i - 1][j + 1];
                octoNode.neighborUpRight.power = nodeUpRight.power;
                octoNode.neighborUpRight.nodeId = nodeUpRight.nodeId;
                nodeUpRight.neighborDownLeft.power = power;
                nodeUpRight.neighborDownLeft.nodeId = nodeId;
            }
            else if (i > 0 && j > 0) {
                // Add up/down/left/right relationships
                const nodeUp = octoMesh[i - 1][j];
                const previousNode = octoMesh[i][j - 1];
                octoNode.neighborLeft.power = previousNode.power;
                octoNode.neighborLeft.nodeId = previousNode.nodeId;
                previousNode.neighborRight.power = power;
                previousNode.neighborRight.nodeId = nodeId;
                octoNode.neighborUp.power = nodeUp.power;
                octoNode.neighborUp.nodeId = nodeUp.nodeId;
                nodeUp.neighborDown.power = power;
                nodeUp.neighborDown.nodeId = nodeId;

                // Add UP-Left
                const nodeUpLeft = octoMesh[i - 1][j - 1];
                octoNode.neighborUpLeft.power = nodeUpLeft.power;
                octoNode.neighborUpLeft.nodeId = nodeUpLeft.nodeId;
                nodeUpLeft.neighborDownRight.power = power;
                nodeUpLeft.neighborDownRight.nodeId = nodeId;


                // only add UP-Right if we're not at the end
                if (j < powers.length - 1) {
                    const nodeUpRight = octoMesh[i - 1][j + 1];
                    octoNode.neighborUpRight.power = nodeUpRight.power;
                    octoNode.neighborUpRight.nodeId = nodeUpRight.nodeId;
                    nodeUpRight.neighborDownLeft.power = power;
                    nodeUpRight.neighborDownLeft.nodeId = nodeId;
                }
            }

            octoMesh[i].push(octoNode);
        }
    }

    // now that the mesh is built simulate the steps
    let i = 1;
    const intervalId = setInterval(() => {
        console.log('Step:', i);

        // Increment step
        for (const nodes of octoMesh) {
            for (const node of nodes) {
                // first part of the step is to increment all by 1;
                node.stepNum++;
                node.power++;
                const element = document.getElementById(node.nodeId);
                element.innerHTML = node.power;
            }
        }

        // now check for flashes and cascades
        for (const nodes of octoMesh) {
            for (const node of nodes) {
                node.nextStep(octoMesh);
            }
        }

        // part 2 - check if all Octo's flashed during this step
        let numFlashedInStep = 0;
        for (const nodes of octoMesh) {
            for (const node of nodes) {
                if (node.flashedThisStep()) {
                    numFlashedInStep += 1;
                }
            }
        }

        if (numFlashedInStep === 100) {
            console.info('Step where all flashed: ', i);
            clearTimeout(intervalId);
        }
        else if (i === STEPS_NUM - 1) {
            clearTimeout(intervalId);
        }
        else {
            i++;
        }

    }, 400);


    // Part 1 - sum total flashes
    let totalFlashes = 0;
    for (const nodes of octoMesh) {
        for (const node of nodes) {
            totalFlashes += node.totalFlashes;
        }
    }

    console.info('After', STEPS_NUM, 'steps, total flashes:', totalFlashes);
}

class OctoNode {
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

        if (this.power > 0) {
            const element = document.getElementById(this.nodeId);
            element.className = 'normal';
        }


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

            const element = document.getElementById(this.nodeId);
            element.className = 'flash';
            element.innerHTML = this.power;

            // Increase the power of all neighbors
            setTimeout(() => {
                this.increaseNeighborPower(octoMesh, this.neighborUp);
                this.increaseNeighborPower(octoMesh, this.neighborDown);
                this.increaseNeighborPower(octoMesh, this.neighborLeft);
                this.increaseNeighborPower(octoMesh, this.neighborRight);
                this.increaseNeighborPower(octoMesh, this.neighborUpLeft);
                this.increaseNeighborPower(octoMesh, this.neighborUpRight);
                this.increaseNeighborPower(octoMesh, this.neighborDownLeft);
                this.increaseNeighborPower(octoMesh, this.neighborDownRight);
            }, 40);
        }
    }


    flashedThisStep() {
        return this.lastStepFlashed === this.stepNum;
    }
}
