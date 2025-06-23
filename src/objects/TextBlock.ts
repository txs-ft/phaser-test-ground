import { IPoolable } from "txs-phaser-core/dist/core";

const shadowStyle: Phaser.Types.GameObjects.Text.TextShadow = {
  offsetX: 1,
  offsetY: 1,
  color: "#0f0",
  blur: 2,
  stroke: true,
  fill: true
} as const;

const defaultTextStyle: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: "Arial",
  fontSize: "24px",
  fontStyle: "bold",
  color: "#fff",
  backgroundColor: "#000",
  stroke: "#f00",
  strokeThickness: 5,
  shadow: shadowStyle,
  padding: {
    x: 15,
    y: 15
  },
  align: "center",
  maxLines: 1,
  testString: "W",
  lineSpacing: 10,
  letterSpacing: 5
} as const;

export interface TextBlockConfig {

  scene: Phaser.Scene,

  x: number,

  y: number,

  text: string,

  draggable: boolean,

  enablePhysics: boolean

}

export class TextBlock extends Phaser.GameObjects.Text implements IPoolable<TextBlockConfig> {

  private static count: bigint = 0n;
  private static interactionConfig: Phaser.Types.Input.InputConfiguration = {
    draggable: true
  };

  private id: bigint;

  constructor(config: TextBlockConfig) {
    super(config.scene, config.x, config.y, config.text, defaultTextStyle);
    this.id = TextBlock.count++;
    this.setOrigin(0.5, 0.5);
    config.scene.add.existing(this);
    if (config.draggable) {
      this.setInteractive(TextBlock.interactionConfig);
    }
    if (config.enablePhysics) {
      this.enablePhysics();
    }
  }

  onGetFromPool(config: TextBlockConfig): void {
    this.text = config.text;
    this.setPosition(config.x, config.y);
    this.setActive(true);
    this.setVisible(true);
    this.disableInteractive();
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setEnable(true);
      body.setSize();
    }
  }

  onReturnToPool(): void {
    this.setActive(false);
    this.setVisible(false);
    this.disableInteractive();
    if (this.body) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setEnable(false);
    }
  }

  public enablePhysics() {
    this.scene.physics.add.existing(this); // 此行前body為null
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setBounce(0.4, 0.4)
      .setDrag(400, 400)
      .setCollideWorldBounds(true);
  }

  public getId(): bigint {
    return this.id;
  }

}