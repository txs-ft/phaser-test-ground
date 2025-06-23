import { English } from 'txs-phaser-core';
import {Math as PhMath} from 'phaser';
import {TextBlock} from '../objects/TextBlock';

export default class TestScene extends Phaser.Scene {

  private partsOfSpeech: English.PoSCollection | undefined;

  constructor() {
    super('MainScene');
  }

  preload() {
    this.load.image('logo', 'assets/evil-laugh-teacher.png');
    const queryString = window?.location?.search ?? "";
    const params: URLSearchParams = new URLSearchParams(queryString);
    console.log(`Raw: ${queryString}`);
    console.log(`Decoded: ${decodeURIComponent(queryString)}`);
    console.log(`URLSearchParams.toString(): ${params.toString()}`);
    const collection = English.PoSCollection.fromQueryString(queryString, false);
    console.log(collection);
    console.log(collection.toQueryString());
    console.log(collection.toFullURL("https://examples.com"));
    this.partsOfSpeech = collection;
  }

  create() {

    // world physics
    const scale = this.scale;
    console.log(`scale: ${scale.width}, ${scale.height}`);
    this.physics.world.setBounds(0, 0, scale.width, scale.height, true, true, false, true);

    const logo = this.add.image(0, 0, 'logo');
    logo.setScale(0.5);

    const position = new PhMath.Vector2(scale.width / 2, scale.height / 2);
    if (this.partsOfSpeech !== undefined) {
      this.createDraggableTextBlock("the quick fox", position)
    }
    
  }

  createDraggableTextBlock(text: string, position: PhMath.Vector2): void {
    const block = new TextBlock({
      scene: this,
      x: position.x,
      y: position.y,
      text: text,
      draggable: true,
      enablePhysics: false
    });
  }

}