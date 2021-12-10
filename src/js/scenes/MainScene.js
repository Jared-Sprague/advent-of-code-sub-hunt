/* global Phaser */

import Boss from '../actors/Boss';
import config from '../config';
import AoC from '../lib/AoC';

const consola = require('consola').withTag('MainScene');
consola.level = config.LOG_LEVEL;

import Sub from '../actors/Sub';
// import GlowFish from '../actors/GlowFish';

export default class MainScene extends Phaser.Scene {

    constructor() {
        super({ key: 'MainScene' });
    }

    preload() {
    }

    create() {
        consola.log('Create');
        this.cameras.main.fadeIn(config.FADE_DURATION, 0, 0, 0);

        this.victory = false;

        this.scene.setVisible(true, 'UIScene');
        this.scene.get('GameOverScene').hide();
        this.scene.get('VictoryScene').hide();

        this.lights.enable().setAmbientColor(0x111111);

        const sky = this.add.graphics();
        sky.fillStyle(0x99ccff);
        sky.fillRect(0, 0, config.WORLD_WIDTH, config.SKY_HEIGHT);

        // Add clouds
        this.add.image(150, 50, 'cloud-image');
        this.add.image(900, 45, 'cloud-image');
        this.add.image(1800, 40, 'cloud-image');

        // Add the Actors to the scene
        // Barge sprite
        this.bargeSprite = this.add.sprite(1000, 40, 'barge-image');
        this.bargeSprite.scale = 1.2;

        // Rock pillar shapes
        this.shapes = this.cache.json.get('shapes');
        this.matter.world.setBounds(0, 0, config.WORLD_WIDTH, config.WORLD_HEIGHT);

        // Ground sprite
        const ground = this.matter.add.sprite(0, 0, 'ground-image', null,
            { shape: this.shapes.ground });
        ground.setDepth(-2);

        this.bubbles = [];
        for (let i = 0; i < 10; i++) {
            this.generateBubbles(200, 1800, 200, 1000);
        }
        this.time.addEvent({
            delay        : 2000,
            loop         : true,
            callback     : this.generateBubbles,
            callbackScope: this,
        });

        ground.setPosition(975 + ground.centerOfMass.x, 1820 + ground.centerOfMass.y);
        ground.setPipeline('Light2D');

        this.sub = new Sub({
            scene: this,
            sub  : {
                x  : -22,
                y  : -20,
                key: 'sub-image',
            },
            prop: {
                x  : 82,
                y  : 36,
                key: 'propeller',
            },
            pos     : { x: 1000, y: 130 },
            subShape: this.shapes.Sub_Base,
        });

        this.boss = new Boss({
            scene: this,
            sub  : this.sub,
            eyes : {
                x  : 0,
                y  : 0,
                key: 'boss-eyes-image',
            },
            x: 800,
            y: 300,
        });

        this.events.on('lightsOn', () => {
            consola.info('lights on');
            if (this.boss.reveal) {
                this.boss.setReveal(false);
            }
        });
        this.events.on('bossAttack', () => {
            this.sub.disabledByBoss(this.boss);
            this.time.addEvent({
                delay   : 4000,
                loop    : false,
                callback: () => {
                    this.scene.get('GameOverScene').show('monster');
                    this.events.emit('lose');
                },
                callbackScope: this,
            });
        });

        this.glowFishArray = [];
        this.glowFishGroup = this.matter.world.nextGroup(true);
        for (let i = 0; i < 10; i++) {
            const x = Phaser.Math.Between(200, 1500);
            const y = Phaser.Math.Between(config.SKY_HEIGHT + 50, 300);
            const startFrame = Phaser.Math.Between(0, 30);
            const glowFish = this.matter.add.sprite(x, y, 'glow-fish').play({ key: 'glowFishAnimation', startFrame });
            glowFish.setCollisionGroup(-1);
            glowFish.setCollidesWith([]);
            glowFish.setScale(0.25, 0.25);
            glowFish.setPipeline('Light2D');
            glowFish.directionX = Phaser.Math.Between(-1, 1);
            glowFish.setIgnoreGravity(true);
            glowFish.setDepth(-1);
            if (glowFish.directionX === 0) {
                glowFish.directionX = -1;
            }
            this.glowFishArray.push(glowFish);
        }

        this.input.on('pointerdown', (pointer) => {
            if (!this.sub.isDead() && !this.sub.disabled) {
                this.sub.toggleLights();
            }
        });

        // ---- Advent of Code ----
        // DAY 1
        this.sonarDepths = this.cache.json.get('sonar-depths');
        this.gift1 = this.add.sprite(700, 400, 'gift-1');
        this.gift1.setPipeline('Light2D');
        this.gift1.angle = 25;

        // DAY 2
        this.subDirections = this.cache.json.get('directions');
        this.gift2 = this.add.sprite(1400, 410, 'gift-2');
        this.gift2.setPipeline('Light2D');
        this.gift2.angle = -10;

        // DAY 3
        this.diagData = this.cache.json.get('diag');
        this.gift3 = this.add.sprite(770, 715, 'gift-3');
        this.gift3.setPipeline('Light2D');
        this.gift3.angle = 10;

        // DAY 4
        this.bingoBoards = this.cache.json.get('bingo-boards');
        this.gift4 = this.add.sprite(1280, 780, 'gift-4');
        this.gift4.setPipeline('Light2D');
        this.gift4.angle = -5;

        // DAY 5
        this.linesData = this.cache.text.get('lines');
        this.gift5 = this.add.sprite(840, 890, 'gift-5');
        this.gift5.setPipeline('Light2D');
        this.gift5.angle = 15;

        // DAY 6
        this.initialFish = this.cache.text.get('initial-fish');
        this.gift6 = this.add.sprite(1150, 1170, 'gift-6');
        this.gift6.setPipeline('Light2D');
        this.gift6.angle = 0;

        // DAY 7
        this.crabPositions = this.cache.text.get('day7-crabs');
        this.gift7 = this.add.sprite(900, 1420, 'gift-7');
        this.gift7.setPipeline('Light2D');
        this.gift7.angle = 2;

        // DAY 8
        this.day8Input = this.cache.text.get('day8-input');
        this.gift8 = this.add.sprite(1180, 1620, 'gift-8');
        this.gift8.setPipeline('Light2D');
        this.gift8.angle = -25;

        // DAY 9
        this.day9Input = this.cache.text.get('day9-input');
        this.gift9 = this.add.sprite(920, 1855, 'gift-9');
        this.gift9.setPipeline('Light2D');
        this.gift9.angle = 5;


        // DAY 10
        this.day10Input = this.cache.text.get('day10-input');
        // this.gift9 = this.add.sprite(920, 1855, 'gift-9');
        // this.gift9.setPipeline('Light2D');
        // this.gift9.angle = 5;
        AoC.day10(this.day10Input);


        // Place Shipwreck and loot
        this.createShipwreckLoot();

        // Collision checks
        this.collisionChecks();

        // Set up the camera
        this.cameras.main.setBounds(0, 0, config.WORLD_WIDTH, config.WORLD_HEIGHT);
        this.cameras.main.startFollow(this.sub.subMatterContainer, false, 0.05, 0.05);
        this.cameras.main.setBackgroundColor(0x004080);


        this.keys = this.input.keyboard.addKeys('W,S,A,D');
    }

    collisionChecks() {
        this.matter.world.on('collisionstart', (event, a, b) => {
            let subObj = null;
            let otherObj = null;
            if (a.gameObject === this.sub.subMatterContainer) {
                subObj = a;
                otherObj = b;
            }
            else if (b.gameObject === this.sub.subMatterContainer) {
                subObj = b;
                otherObj = a;
            }

            if (subObj && !this.sub.isDead() && otherObj) {
                if (otherObj.parent.label === 'loot') {
                    this.collectLoot(otherObj);
                }
                else if (otherObj.collisionFilter.group === 0) {
                    consola.info('collided with ground');
                    this.sub.takeDamage(config.ROCK_DAMAGE);
                    if (this.sub.isDead()) {
                        this.matter.world.setGravity(0, config.GRAVITY);
                        this.scene.get('GameOverScene').show('rocks');
                        this.events.emit('lose');
                        this.sub.flickerLights();
                    }
                }
                else {
                    consola.info('unknown collision: ' + otherObj.collisionFilter.group);
                }
            }
        });
    }

    generateBubbles(minX = 200, maxX = 1800, minY = 2000, maxY = 3000) {
        const x = Phaser.Math.Between(minX, maxX);
        const y = Phaser.Math.Between(minY, maxY);

        const frameRate = Phaser.Math.Between(5, 30);
        const bubble = this.add.sprite(x, y, 'bubbles').play({ key: 'bubblesAnimation', frameRate });
        bubble.setScale(.25, .25);
        bubble.setPipeline('Light2D');
        bubble.setOrigin(0, 0);
        bubble.setDepth(1000);
        bubble.tint = 0x001a33;
        this.bubbles.push(bubble);
    }

    update(time, delta) {
        if (!this.victory) {
            this.sub.update(this.keys);
        }

        if (this.sub.subMatterContainer.y > config.BOSS_REVEAL_DEPTH && !this.sub.lightIsOn() && !this.sub.isDead()) {
            this.boss.setReveal(true);
        }
        else if (this.sub.subMatterContainer.y < config.BOSS_REVEAL_DEPTH && this.boss.reveal) {
            this.boss.setReveal(false);
        }

        this.boss.update(delta);

        this.setAmbientColor();

        this.bubbles.forEach((bubble, index, object) => {
            bubble.y -= 50 * delta / 1000;
            if (bubble.y < config.SKY_HEIGHT) {
                bubble.destroy();
                object.splice(index, 1);
            }
        });

        this.glowFishArray.forEach((fish, index, object) => {
            if (Phaser.Geom.Intersects.RectangleToRectangle(this.sub.plunger.getBounds(), fish.getBounds())) {
                if (this.sub.lightChargeLevel < 1.0) {
                    this.sub.pickupGlowFish();
                    fish.destroy();
                    object.splice(index, 1);
                }
            }
            else {
                fish.setVelocityX(.5 * fish.directionX);
                fish.flipX = fish.directionX < 0;

                if (fish.x < 100) {
                    fish.directionX = 1;
                }
                else if (fish.x > 1800) {
                    fish.directionX = -1;
                }
            }
        }, this);

        // AoC gift collisions
        this.handleGiftCollisions();

        const distance = Phaser.Math.Distance.BetweenPoints(this.sub.subContainer, this.bargeSprite);
        if (distance < 120 && this.sub.hasLoot) {
            this.deliverLoot();
        }
    }

    setAmbientColor() {
        const lightAmbient = Phaser.Display.Color.HexStringToColor('0x449df6');
        const darkAmbient = Phaser.Display.Color.HexStringToColor('0x0');

        const maxDarkDepth = 2300;
        const subDepth = Phaser.Math.Clamp(this.sub.subMatterContainer.y, 0, maxDarkDepth);

        const newAmbient = Phaser.Display.Color.Interpolate.ColorWithColor(lightAmbient, darkAmbient,
            maxDarkDepth, subDepth);
        const newAmbientNumber = Phaser.Display.Color.ValueToColor(newAmbient).color;
        this.lights.setAmbientColor(newAmbientNumber);
        this.cameras.main.setBackgroundColor(newAmbient);
    }

    createShipwreckLoot() {
        const spawnPositions = [
            // Left
            {
                loot : { x: 315, y: 2880 },
                wreck: { x: 275, y: 2880 },
            },
            // Center
            {
                loot : { x: 1045, y: 2870 },
                wreck: { x: 1000, y: 2870 },
            },
            // Right
            {
                loot : { x: 1800, y: 2920 },
                wreck: { x: 1760, y: 2920 },
            },
        ];

        // Pick a random spawn point for the loot
        const spawnPosition = spawnPositions[Phaser.Math.Between(0, 2)];

        const lootImage = this.matter.add.image(spawnPosition.loot.x, spawnPosition.loot.y, 'loot-image', null,
            { shape: this.shapes.Loot, label: 'loot' });

        lootImage.setScale(0.5, 0.5);
        lootImage.setPipeline('Light2D');

        const wreckImage = this.add.image(spawnPosition.wreck.x, spawnPosition.wreck.y, 'wreck-image');
        wreckImage.setScale(0.5, 0.5);
        wreckImage.setPipeline('Light2D');
    }

    collectLoot(loot) {
        // remove loot from scene
        loot.gameObject.destroy();

        // Update sub
        this.sub.collectLoot();
        this.events.emit('loot');
    }

    deliverLoot() {
        consola.log('Loot delivered');
        this.bargeSprite.setTexture('barge-filled-image');
        this.events.emit('loot');
        this.sub.deliverLoot();
        this.scene.get('VictoryScene').show();
        this.events.emit('win');
        this.sub.hasWon = true;
    }

    async handleGiftCollisions() {
        if (this.gift1 && this.checkSubGiftIntersect(this.gift1)) {
            consola.info('Collided with gift 1');
            const numIncreasingDepths = AoC.getIncreasingDepthsNum(this.sonarDepths, 1);
            const numIncreasingGroups = AoC.getIncreasingDepthsNum(this.sonarDepths, 3);
            consola.log('[DAY 1-1] Increasing depths: ', numIncreasingDepths);
            consola.log('[DAY 1-2] Increasing depths groups: ', numIncreasingGroups);

            // Speech Bubble
            this.sub.createSpeechBubble(400, 110, 'Sonar depth mapping complete, Captain!');

            this.gift1.destroy();
            this.gift1 = null;
        }
        else if (this.gift2 && this.checkSubGiftIntersect(this.gift2)) {
            consola.info('Collided with gift 2');

            AoC.multiplyDirections(this.subDirections);
            const directionsProduct = AoC.multiplyDirections(this.subDirections);
            consola.log('[DAY 2-2] Directions product: ', directionsProduct);

            // Speech Bubble
            this.sub.createSpeechBubble(400, 110, 'Sub instructions received, Captain!');

            this.gift2.destroy();
            this.gift2 = null;
        }
        else if (this.gift3 && this.checkSubGiftIntersect(this.gift3)) {
            consola.info('Collided with gift 3');

            const diagReport = AoC.getDiagnosticReport(this.diagData);
            consola.log('[DAY 3] Diagnostics report:', diagReport);

            // Speech Bubble
            this.sub.createSpeechBubble(400, 110, 'Diagnostic Report analyzed, Captain!');

            this.gift3.destroy();
            this.gift3 = null;
        }
        else if (this.gift4 && this.checkSubGiftIntersect(this.gift4)) {
            consola.info('Collided with gift 4');

            const boards = AoC.playBingo(this.bingoBoards);
            consola.log('[DAY 4] First winning number:', boards.first, ' last winning number:', boards.last);

            // Speech Bubble
            this.sub.createSpeechBubble(400, 110, 'You beat that squid good in Bingo, Captain!');

            this.gift4.destroy();
            this.gift4 = null;
        }
        else if (this.gift5 && this.checkSubGiftIntersect(this.gift5)) {
            consola.info('Collided with gift 5');

            // Speech Bubble
            this.sub.createSpeechBubble(400, 110, 'Geyser mapping complete, Captain!');
            consola.log('[DAY 5-1] Total overlapping points:', AoC.getLineIntersects(this.linesData));
            consola.log('[DAY 5-2] Total overlapping points:', AoC.getLineIntersects(this.linesData, true));

            this.gift5.destroy();
            this.gift5 = null;
        }
        else if (this.gift6 && this.checkSubGiftIntersect(this.gift6)) {
            consola.info('Collided with gift 6');

            const part1Num = AoC.getFishNum(this.initialFish, 80);
            const part2Num = AoC.getFishNum(this.initialFish, 256);
            consola.log('[DAY 6-1] Total fish after 80 days:', part1Num);
            consola.log('[DAY 6-2] Total fish after 256 days:', part2Num);

            // Speech Bubble
            this.sub.createSpeechBubble(400, 110, 'The fish are multiplying, Captain!');

            this.gift6.destroy();
            this.gift6 = null;
        }
        else if (this.gift7 && this.checkSubGiftIntersect(this.gift7)) {
            consola.info('Collided with gift 7');

            let leastFuel = AoC.getLeastFuel(this.crabPositions);
            consola.log('[DAY 7-1] Least fuel used:', leastFuel);
            leastFuel = AoC.getLeastFuel(this.crabPositions, false);
            consola.log('[DAY 7-2] Least fuel used:', leastFuel);

            // Speech Bubble
            this.sub.createSpeechBubble(400, 110, 'Crabs are aligned, Captain!');

            this.gift7.destroy();
            this.gift7 = null;
        }
        else if (this.gift8 && this.checkSubGiftIntersect(this.gift8)) {
            consola.info('Collided with gift 8');

            const result = AoC.day8(this.day8Input);
            consola.log('[DAY 8] Total unique:', result.totalUnique, ' Sum of output:', result.outputSum);

            // Speech Bubble
            this.sub.createSpeechBubble(400, 110, 'We fixed the 4 digit display, Captain!');

            this.gift8.destroy();
            this.gift8 = null;
        }
        else if (this.gift9 && this.checkSubGiftIntersect(this.gift9)) {
            consola.info('Collided with gift 9');

            const result = AoC.day9(this.day9Input);
            consola.log('[DAY 9] Risk level:', result.riskLevelPart1, ' part 2 answer:', result.answerPart2);

            // Speech Bubble
            this.sub.createSpeechBubble(400, 110, 'Basins mapped, Captain!');

            this.gift9.destroy();
            this.gift9 = null;
        }
    }

    checkSubGiftIntersect(giftSprite) {
        return (Phaser.Geom.Intersects.RectangleToRectangle(this.sub.plunger.getBounds(), giftSprite.getBounds()));
    }
}
