export default class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image('logo', 'assets/evil-laugh-teacher.png');
  }

  create() {
    const logo = this.add.image(300, 300, 'logo');
    //logo.setScale(1);
  }
}