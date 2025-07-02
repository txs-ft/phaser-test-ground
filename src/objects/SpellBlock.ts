import { PhonemeBlock } from "txs-phaser-core";
import { PhonemeType } from "txs-phaser-core/dist/english/Phoneme";

export class SpellBlock extends PhonemeBlock {

  private _isHighlighted: boolean = false;

  public get isHighlighted(): boolean {
    return this._isHighlighted;
  }

  public set isHighlighted(value: boolean) {
    this._isHighlighted = value;
    if (value) {
      this.setStyle(SpellBlock.highlightedStyle);
    } else {
      this.setStyle(SpellBlock.notHighlightedStyle);
    }
  }

  public override initialize(text: string): void {
    super.initialize(text);
    this.arcadeBody.enable = false;
  }

  public override initializePhonemeBlock(soundType: PhonemeType, text: string): void {
    super.initializePhonemeBlock(soundType, text);
    this.isHighlighted = true;
  }

  private static readonly highlightedStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    stroke: "#FF0000",
    strokeThickness: 5
  };

  private static readonly notHighlightedStyle: Phaser.Types.GameObjects.Text.TextStyle = {
    strokeThickness: 0
  }

}