/* global Phaser */

import config from '../config';

const consola = require('consola').withTag('InstructionsScene');
consola.level = config.LOG_LEVEL;

/**
 * MenuScene is the scene of the main menu of the game
 */
export default class InstructionsScene extends Phaser.Scene {

    /**
     * construct passing the unique key to the game instance
     */
    constructor() {
        super({ key: 'InstructionsScene' });
    }

    /**
     * Create the games Main Menu
     *
     * @param {object} data generic data to pass between scenes
     */
    create(data) {
        consola.log('Create');

        const backgroundImage = this.add.image(0, 0, 'tutorial_screen-image');
        backgroundImage.setOrigin(0, 0);
        backgroundImage.setScale(.55);

        // Play Button
        this.playButton = this.add.sprite(config.GAME_WIDTH / 2, config.GAME_HEIGHT - 50, 'button-play-20-image');
        this.playButton.setInteractive();
        this.playButton.setScale(0.5);

        this.playButton.on('pointerover', () => {
            this.playButton.setTexture('button-play-50-image');
        });

        this.playButton.on('pointerout', () => {
            this.playButton.setTexture('button-play-20-image');
        });

        this.playButton.on('pointerup', () => {
            this.cameras.main.fadeOut(config.FADE_DURATION, 0, 0, 0);

            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('BackstoryScene');
            });
        });
    }
}
