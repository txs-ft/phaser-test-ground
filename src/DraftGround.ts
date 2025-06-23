import {Core} from 'txs-phaser-core';

export default class DraftGround extends Phaser.Game {

  private createCallback: Core.CallbackEmitter<DraftGround, string>;
  private resetCallback: Core.CallbackEmitter<DraftGround, typeof undefined>;
  private copyCallback: Core.CallbackEmitter<DraftGround, typeof undefined>;

  constructor(config?: Phaser.Types.Core.GameConfig) {
    super(config);
    this.createCallback = new Core.CallbackEmitter(this);
    this.resetCallback = new Core.CallbackEmitter(this);
    this.copyCallback = new Core.CallbackEmitter(this);
  }

  public registerCreate(receiver: object, callback: Core.Callback<DraftGround, string>): void {
    this.createCallback.register(receiver, callback);
  }

  public registerReset(receiver: object, callback: Core.Callback<DraftGround, undefined>): void {
    this.resetCallback.register(receiver, callback);
  }

  public registerCopy(receiver: object, callback: Core.Callback<DraftGround, undefined>): void {
    this.copyCallback.register(receiver, callback);
  }

  public requestCreate(question: string): void {
    this.createCallback.emit(question);
  }

  public requestReset(): void {
    this.resetCallback.emit(undefined);
  }

  public requestCopy(): void {
    this.copyCallback.emit(undefined);
  }

  public clearRegisters(): void {
    this.createCallback.clear();
    this.resetCallback.clear();
  }

}
