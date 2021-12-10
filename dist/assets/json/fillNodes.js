// DAY 9
let heightMesh;

async function day9(input) {
    input = input.trim();
    const lines = input.split('\n');
    heightMesh = [];
    let riskLevelPart1 = 0;
    const basins = {};

    // Build the Height Mesh
    for (const [i, line] of lines.entries()) {
        const heights = line.split('');
        heightMesh.push([]);

        for (let [j, height] of heights.entries()) {
            height = parseInt(height);
            const nodeId = `${i}-${j}`;
            const heightNode = new HeightNode(height, nodeId);

            if (i === 0 && j > 0) {
                // create left/right relationship with previous height node
                const previousNode = heightMesh[i][j - 1];
                heightNode.neighborLeft.height = previousNode.height;
                heightNode.neighborLeft.nodeId = previousNode.nodeId;
                previousNode.neighborRight.height = height;
                previousNode.neighborRight.nodeId = nodeId;
            }
            else if (i > 0 && j === 0) {
                // only add neighbor UP
                const nodeUp = heightMesh[i - 1][j];
                heightNode.neighborUp.height = nodeUp.height;
                heightNode.neighborUp.nodeId = nodeUp.nodeId;
                nodeUp.neighborDown.height = height;
                nodeUp.neighborDown.nodeId = nodeId;
            }
            else if (i > 0 && j > 0) {
                // Add up/down/left/right relationships
                const nodeUp = heightMesh[i - 1][j];
                const previousNode = heightMesh[i][j - 1];
                heightNode.neighborLeft.height = previousNode.height;
                heightNode.neighborLeft.nodeId = previousNode.nodeId;
                previousNode.neighborRight.height = height;
                previousNode.neighborRight.nodeId = nodeId;
                heightNode.neighborUp.height = nodeUp.height;
                heightNode.neighborUp.nodeId = nodeUp.nodeId;
                nodeUp.neighborDown.height = height;
                nodeUp.neighborDown.nodeId = nodeId;
            }

            heightMesh[i].push(heightNode);
        }
    }


    // Part 1
    for (const nodes of heightMesh) {
        for (const node of nodes) {
            if (node.isLowerThanNeighbors()) {
                console.info('lowest point:', node.height);
                const element = document.getElementById(node.nodeId);
                element.className = 'lowest';
                riskLevelPart1 += node.height + 1;
            }
        }
    }

    console.info('[DAY 9-1] Risk level:', riskLevelPart1);

    // Part 2
    for (const nodes of heightMesh) {
        for (const node of nodes) {
            node.basinId = this.findBasinId(node.nodeId);
            if (node.basinId && !basins[node.basinId]) {
                basins[node.basinId] = 1;
                await fillNode(node);
            }
            else if (node.basinId) {
                basins[node.basinId]++;
                await fillNode(node);
            }
        }
    }

    // Multiply the largest 3 basins together to get the answer
    const basinsArray = Object.values(basins).sort((a, b) => a - b).reverse();
    const answerPart2 = basinsArray[0] * basinsArray[1] * basinsArray[2];

    console.info('[DAY 9-2] Basins answer:', answerPart2);

    return { riskLevelPart1: riskLevelPart1, answerPart2: answerPart2 };
}

let bgColor = 0;
let currentBasinId = '';
const basinColors = {};
async function fillNode(node) {
    if (currentBasinId !== node.basinId) {
        currentBasinId = node.basinId;
        if (basinColors[node.basinId]) {
            bgColor = basinColors[node.basinId];
        }
        else {
            basinColors[node.basinId] = bgColor += 30;
        }

        if (bgColor >= 360) {
            bgColor = 0;
        }
    }
    if (!node.isLowerThanNeighbors()) {
        const element = document.getElementById(node.nodeId);
        element.className = 'filled';
        element.style.background = `hsl(${bgColor},   100%, 50%)`;
        await sleep(0);
    }
}

/**
 * Recursively follow the flow to the nearest basin
 */
function findBasinId(nodeId) {
    const idPair = nodeId.split('-');
    const node = heightMesh[idPair[0]][idPair[1]];

    if (node.height === 9) {
        return null;
    }
    else if (node.isLowerThanNeighbors() || node.basinId) {
        return node.basinId;
    }
    else {
        // recursively follow the flow
        const lowestNodeId = node.getLowestNeighborNodeId();
        return findBasinId(lowestNodeId);
    }
}

class HeightNode {
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


function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
