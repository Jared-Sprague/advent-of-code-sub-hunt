/* global Phaser */

import config from '../config';

const consola = require('consola').withTag('Sub');
consola.level = config.LOG_LEVEL;

export default class Sub extends Phaser.GameObjects.GameObject {
    constructor(config) {
        super(config.scene);

        this.hasWon = false;
        this.subSprite = config.scene.add.sprite(config.sub.x, config.sub.y, config.sub.key);
        this.subSprite.setPipeline('Light2D');
        this.propSprite = config.scene.add.sprite(config.prop.x, config.prop.y, config.prop.key).play('propellerAnimation');
        this.propSprite.setPipeline('Light2D');

        this.plunger = config.scene.add.rectangle(-120, -15, 25, 25);

        this.subContainer = config.scene.add.container(config.pos.x, config.pos.y,
            [this.propSprite, this.subSprite, this.plunger]);

        const colGroup = config.scene.matter.world.nextGroup();
        this.subMatterContainer = config.scene.matter.add.gameObject(this.subContainer, { shape: config.subShape });
        this.subMatterContainer.setScale(0.5, 0.5);
        this.subMatterContainer.setCollisionGroup(colGroup);

        // relative to sprite origin
        this.lightLocation = {
            x: 135 - this.subSprite.width / 2,
            y: 20 - this.subSprite.height / 2,
        };

        this.lightColor = 0xffffff;

        this.lightChargeLevel = 1.0;
        this.health = 1.0;

        this.hasLoot = false;
        this.disabled = false;

        config.scene.time.addEvent({
            delay        : 1000,
            loop         : true,
            callback     : this.lightPowerTick,
            callbackScope: this,
        });

        this.createLights(config.scene);
        this.toggleLights(); // Start with lights on

        // this.cursorKeys = this.scene.input.keyboard.createCursorKeys();
        const keyObj = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        keyObj.on('down', () => {
            this.toggleLights();
        });
    }

    lightPowerTick() {
        if (this.lightIsOn() && !config.LIGHTS_ALWAYS_ON && !this.isDead()) {
            this.lightChargeLevel = Phaser.Math.Clamp(this.lightChargeLevel - config.LIGHT_POWER_DRAIN, 0, 1);
            if (this.lightChargeLevel === 0) {
                consola.log('out of power');
                this.toggleLights();
            }
            this.scene.events.emit('lightChargeChanged', this.lightChargeLevel);
        }
    }

    update(keys) {
        if (this.disabled) return;

        if (!this.isDead()) {
            const surfaceLevel = (config.SKY_HEIGHT - 60) + (this.subSprite.height / 2);
            const atSurface = this.subMatterContainer.y < surfaceLevel;

            if (!this.hasWon) {
                this.handleInput(keys, atSurface);
            }

            const lerpRotation = Phaser.Math.Linear(this.subMatterContainer.rotation, 0, 0.2);

            this.subMatterContainer.setRotation(lerpRotation);

            if (atSurface) {
                this.subMatterContainer.y = surfaceLevel;
            }
        }

        this.light.x = this.lightLocation.x + this.subMatterContainer.x;
        this.light.y = this.lightLocation.y + this.subMatterContainer.y;

        this.updateSpeechBubble();
    }

    flickerLights() {
        consola.info('flicker');
        const delay = Phaser.Math.Between(100, 500);
        this.scene.time.addEvent({
            delay        : delay,
            loop         : false,
            callback     : this.flickerLights,
            callbackScope: this,
        });

        this.toggleLights();
    }

    toggleLights() {
        if (!this.lightIsOn() && this.lightChargeLevel > 0) {
            this.light.setRadius(300);
            if (!this.isDead()) {
                this.scene.events.emit('lightsOn');
            }
        }
        else {
            this.light.setEmpty();
            if (!this.isDead()) {
                this.scene.events.emit('lightsOff');
            }
        }
    }

    lightIsOn() {
        return !this.light.isEmpty();
    }

    createLights(scene) {
        this.light = scene.lights.addLight(this.lightLocation.x + this.subMatterContainer.x,
            this.lightLocation.y + this.subMatterContainer.y, 300)
            .setColor(this.lightColor).setIntensity(5);
        this.light.setEmpty();
    }

    pickupGlowFish() {
        consola.info('picked up glowfish');
        this.lightChargeLevel = Phaser.Math.Clamp(this.lightChargeLevel + .3, 0, 1);
        this.scene.events.emit('lightChargeChanged', this.lightChargeLevel);
        this.scene.events.emit('pickupGlowFish');
    }

    takeDamage(amount) {
        if (!config.INVULNERABLE) {
            this.health = Phaser.Math.Clamp(this.health - amount, 0, 1);
            this.scene.events.emit('healthChanged', this.health);

            if (this.health <= 0.3) {
                if (this.hasLoot) {
                    this.subSprite.setTexture('sub-loot-damaged-image');
                }
                else {
                    this.subSprite.setTexture('sub-damaged-image');
                }
            }

            if (this.health === 0) {
                consola.log('dead');
                this.propSprite.anims.stop();
            }
        }
    }

    isDead() {
        return this.health === 0;
    }

    flipX(direction) {
        if (direction === 'left') {
            this.subMatterContainer.setScale(0.5, 0.5);
        }
        else if (direction === 'right') {
            this.subMatterContainer.setScale(-0.5, 0.5);
        }
    }

    collectLoot() {
        // change texture and body shape
        this.subSprite.setTexture('sub-loot-image');
        this.hasLoot = true;
    }

    deliverLoot() {
        this.subSprite.setTexture('sub-image');
        this.hasLoot = false;
    }

    handleInput(keys, atSurface) {
        if (keys.W.isDown && !atSurface) {
            this.subMatterContainer.thrustLeft(config.THRUST_POWER);
        }
        if (keys.A.isDown) {
            this.subMatterContainer.thrustBack(config.THRUST_POWER);
            this.flipX('left');
        }
        if (keys.S.isDown) {
            this.subMatterContainer.thrustRight(config.THRUST_POWER);
        }
        if (keys.D.isDown) {
            this.subMatterContainer.thrust(config.THRUST_POWER);
            this.flipX('right');
        }
    }

    disabledByBoss(boss) {
        this.disabled = true;
        this.subMatterContainer.setVelocity(0, 0);
        this.subMatterContainer.setRotation(0);
        this.subSprite.resetPipeline();
        this.propSprite.resetPipeline();
        this.propSprite.anims.stop();
        this.subMatterContainer.y = boss.bossContainer.y + 20;
    }

    createSpeechBubble(width, height, quote) {
        // First clean up any existing bubbles
        this.destroySpeechBubble();

        const x = this.subContainer.x - 50;
        const y = this.subContainer.y - height - 100;
        this.bubbleWidth = width;
        this.bubbleHeight = height;
        const bubblePadding = 10;
        const arrowHeight = this.bubbleHeight / 4;

        this.bubble = this.scene.add.graphics({ x: x, y: y });

        //  Bubble shadow
        this.bubble.fillStyle(0x222222, 0.5);
        this.bubble.fillRoundedRect(6, 6, this.bubbleWidth, this.bubbleHeight, 16);

        //  Bubble color
        this.bubble.fillStyle(0xffffff, 1);

        //  Bubble outline line style
        this.bubble.lineStyle(4, 0x565656, 1);

        //  Bubble shape and outline
        this.bubble.strokeRoundedRect(0, 0, this.bubbleWidth, this.bubbleHeight, 16);
        this.bubble.fillRoundedRect(0, 0, this.bubbleWidth, this.bubbleHeight, 16);

        //  Calculate arrow coordinates
        const point1X = Math.floor(this.bubbleWidth / 7);
        const point1Y = this.bubbleHeight;
        const point2X = Math.floor((this.bubbleWidth / 7) * 2);
        const point2Y = this.bubbleHeight;
        const point3X = Math.floor(this.bubbleWidth / 7);
        const point3Y = Math.floor(this.bubbleHeight + arrowHeight);

        //  Bubble arrow shadow
        this.bubble.lineStyle(4, 0x222222, 0.5);
        this.bubble.lineBetween(point2X - 1, point2Y + 6, point3X + 2, point3Y);

        //  Bubble arrow fill
        this.bubble.fillTriangle(point1X, point1Y, point2X, point2Y, point3X, point3Y);
        this.bubble.lineStyle(2, 0x565656, 1);
        this.bubble.lineBetween(point2X, point2Y, point3X, point3Y);
        this.bubble.lineBetween(point1X, point1Y, point3X, point3Y);

        this.bubbleContent = this.scene.add.text(0, 0, quote, {
            fontFamily: 'Arial',
            fontSize  : 20,
            color     : '#000000',
            align     : 'center',
            wordWrap  : { width: this.bubbleWidth - (bubblePadding * 2) },
        });

        const b = this.bubbleContent.getBounds();

        this.bubbleContent.setPosition(this.bubble.x + (this.bubbleWidth / 2) - (b.width / 2), this.bubble.y +
            (this.bubbleHeight / 2) - (b.height / 2));

        this.bubbleTimeout = setTimeout(() => {
            this.destroySpeechBubble();
        }, 4500);
    }

    destroySpeechBubble() {
        consola.info('Destroying speech bubble');
        if (this.bubbleTimeout) {
            clearTimeout(this.bubbleTimeout);
        }

        if (this.bubble) {
            this.bubble.destroy();
            this.bubble = null;
        }

        if (this.bubbleContent) {
            this.bubbleContent.destroy();
            this.bubbleContent = null;
        }
    }

    updateSpeechBubble() {
        if (this.bubble && this.bubbleContent) {
            // set speech bubble position
            const x = this.subContainer.x - 50;
            const y = this.subContainer.y - this.bubbleHeight - 100;
            const b = this.bubbleContent.getBounds();

            this.bubble.setPosition(x, y);
            this.bubbleContent.setPosition(this.bubble.x + (this.bubbleWidth / 2) - (b.width / 2), this.bubble.y +
                (this.bubbleHeight / 2) - (b.height / 2));
        }
    }
}
