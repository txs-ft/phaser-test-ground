import Phaser from 'phaser';
import TestScene from './scenes/TestScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(25,25,25,50)',
  scene: [
    TestScene
  ],
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      // gravity: { x: 0, y: 3136 },
      gravity: { x: 0, y: 0 }//,
      //debug: true,
      //debugShowBody: false,
      //debugShowVelocity: false
    }
  },
  //transparent: true
};

const game = new Phaser.Game(config);
game.canvas.style.position = "absolute",
game.canvas.style.zIndex = "100";