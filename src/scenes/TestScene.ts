export default class TestScene extends Phaser.Scene {

  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image('logo', 'assets/evil-laugh-teacher.png');
  }

  create() {
    const logo = this.add.image(0, 0, 'logo');
    logo.setScale(0.5);
    logo.setPosition(this.scale.width / 2, this.scale.height / 2);
    
  }

}