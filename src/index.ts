import Phaser from 'phaser';
import TestScene from './scenes/TestScene';
import { ScoreSubmissionHandler } from './ScoreSubmissionHandler';

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

const handler = new ScoreSubmissionHandler();


handler.setRecord("Boris", 20, "WE*&R)&FD)");
handler.submit();

setTimeout(() => {
  handler.setRecord("Alice", 20, "WE*&R)&FD)");
  handler.submit();
}, 4000);

setTimeout(() => {
  handler.setRecord("Crazy Ivan", 20, "WE*&R)&FD)");
  handler.submit();
}, 8000);

setTimeout(() => {
  handler.setRecord("Sip", 20, "WE*&R)&FD)");
  handler.submit();
}, 12000);

setTimeout(() => {
  handler.setRecord("Flip", 20, "WE*&R)&FD)");
  handler.submit();
}, 16000);