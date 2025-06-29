import Phaser from 'phaser';
import TestScene from './scenes/TestScene';
import { GoogleFormSubmissionHandler } from 'txs-phaser-core';

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



const handler = new GoogleFormSubmissionHandler(
  "1FAIpQLSe0t3ksEbT-r6vc9Lij8ADDKvQMV_YYYvBXpvBtLcaxRayCXQ",
  [
    "entry.42132087",
    "entry.426031421",
    "entry.1870105313",
    "entry.847587394"
  ]
);


handler.submit("Boris", Date.now().toString(), "20", "WE*&R)&FD)");

setTimeout(() => {
  handler.submit("Alice", Date.now().toString(), "20", "WE*&R)&FD)");
}, 4000);

/*setTimeout(() => {
  handler.submit("Crazy Ivan", Date.now().toString(), "20", "WE*&R)&FD)");
}, 8000);

setTimeout(() => {
  handler.submit("Sip", Date.now().toString(), "20", "WE*&R)&FD)");
}, 12000);

setTimeout(() => {
  handler.submit("Flip", Date.now().toString(), "20", "WE*&R)&FD)");
}, 16000);*/