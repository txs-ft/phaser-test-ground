import {Callback, Event} from 'txs-phaser-core';

export default class DraftGround extends Phaser.Game {


  public readonly CreateRequested = new Event<DraftGround, [string]>();

  public readonly ResetRequested = new Event<DraftGround>();

  public readonly CopyRequested = new Event<DraftGround>();


  public requestCreate(question: string): void {
    this.CreateRequested.invoke(this, question);
  }

  public requestReset(): void {
    this.ResetRequested.invoke(this);
  }

  public requestCopy(): void {
    this.CopyRequested.invoke(this);
  }

}
