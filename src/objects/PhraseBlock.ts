import { PoS, PoSStyles } from 'txs-phaser-core';

export class PhraseBlock extends Phaser.GameObjects.Text  {

  private partsOfSpeech: PoS = PoS.OTHER;
  private cache = {
    color: "",
    backgroundColor: ""
  }

  public getPartsOfSpeech(): PoS { return this.partsOfSpeech; }

  public setPartsOfSpeech(pos: PoS): void {
    if (this.partsOfSpeech !== pos) {
      //this.style.color = PoSStyles[pos]
      const style = PoSStyles[pos];
      const cache = this.cache;
      cache.color = style.colorFront;
      cache.backgroundColor = style.colorBack;
      this.setStyle(cache);
      this.partsOfSpeech = pos;
    }
  }

  public cyclePoS(): void {
    this.setPartsOfSpeech((this.getPartsOfSpeech() + 1) % 6);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
    super(scene, x, y, text, PhraseBlock.defaultStyle);
    this.setInteractive({
      draggable: true
    });
    this.setOrigin(0.5, 0.5);
  }

  public initialize(text: string): void {
    const style = PoSStyles[PoS.OTHER];
    this.cache.color = style.colorFront;
    this.cache.backgroundColor = style.colorBack;
    this.setStyle(this.cache);
    this.text = text;
    (this.body as Phaser.Physics.Arcade.Body).setSize();
    this.setActive(true);
    this.setVisible(true);
  }

  private static readonly defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    color: PoSStyles[PoS.OTHER].colorFront, // 文字顏色
    backgroundColor: PoSStyles[PoS.OTHER].colorBack, // 背景顏色
    // 我們只需要改變上面兩個
    fontFamily: "Arial",
    fontSize: "24px",
    fontStyle: "bold",
    //stroke: "#f00",
    //strokeThickness: 5,
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

}
