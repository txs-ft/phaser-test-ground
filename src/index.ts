import Phaser from 'phaser';
import TestScene from './scenes/TestScene';
import DraftScene from './scenes/DraftScene';
import DraftGround from './DraftGround';
import { DraftGroundHtmlUI } from './ui/DraftGroundHtmlUI';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(25,25,25,50)',
  scene: [
    DraftScene,
    TestScene,
  ],
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      // gravity: { x: 0, y: 3136 },
      gravity: { x: 0, y: 0 },
      debug: true,
      debugShowBody: true,
      debugShowVelocity: true
    }
  },
  //transparent: true
};

const game = new DraftGround(config);
game.canvas.style.position = "absolute",
game.canvas.style.zIndex = "100";
const gameUI = new DraftGroundHtmlUI(game);