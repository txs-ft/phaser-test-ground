// 开发环境使用模块导入
// 生产环境使用全局 Phaser 变量
if (import.meta.env.PROD) {
  // 生产环境使用全局 Phaser
  (window as any).Phaser = Phaser;
} else {
  // 开发环境保持模块导入
  import Phaser from 'phaser';
}

import MainScene from './scenes/MainScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [MainScene],
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 } }
  }
};

const game = new (window as any).Phaser.Game(config);