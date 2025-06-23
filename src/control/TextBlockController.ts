import { TextBlock } from '../objects/TextBlock';

/**
 * 實現{@link TextBlock}拖曳及點擊變色邏輯的控制器。
 */
export class TextBlockController extends Phaser.GameObjects.GameObject {

  /**
   * 用戶是否曾經拖曳字塊？
   * 
   * 是的話，我們不需要在用戶放手時讓字塊變色。
   * 
   * 否的話，用戶真的是在點擊字塊，所以需要變色。
   */
  private hasDragged: boolean;

  /**
   * 創建一個{@link TextBlockController}個例。
   * @param scene 場景
   */
  constructor(scene: Phaser.Scene) {
    super(scene, "TextBlockController");
    scene.add.existing(this);
    this.hasDragged = false;
    
    this.setupInput();
    
  }
  
  // 使用普通事件
  
  /**
   * 設置用戶輸入邏輯。
   */
  private setupInput() {
    const Events = Phaser.Input.Events;
    const input = this.scene.input;
    input.dragTimeThreshold = 100;
    input.on(Events.GAMEOBJECT_DOWN, this.onDown.bind(this));
    input.on(Events.DRAG_START, this.onDragStart.bind(this));
    input.on(Events.DRAG, this.onDrag.bind(this));
    input.on(Events.DRAG_END, this.onDragEnd.bind(this));
    input.on(Events.GAMEOBJECT_UP, this.onUp.bind(this));

    // ** 對上述五種事件的研究結果** 
    // 前提：input.dragTimeThreshold設定為100ms。
    // 事件觸發次序：onDown → onDragStart → onDrag → onDragEnd → onUp
    // 不設定input.dragTimeThreshold的話，其值默認為0，會導致onDown與onDragStart同步觸發，onDragEnd與onUp同步觸發。

    // ** 初步設計思路 **
    // onDown(): hasDragged → false
    // onDragStart(): hasDragged → true
    // onUp(): hasDragged → false
    // 隱患？如果dragTimeThreshold太長，用戶只要不放手，
    // 依然可以在手指離開TextBlock範圍後拖動TextBlock。
    // 若在TextBlock之外放手，不會觸發onUp。而如果放手時，
    // 手指剛好在另一個TextBlock之上，會觸發另一個TextBlock
    // 的onUp。需要根據情況，考慮存下引用，追蹤被拖曳的個例。

    // ** 測試場景有2個TextBlock時的表現 **
    // 點擊兩個TextBlock重疊的區域：上層TextBlock有onDown和onUp。
    // 拖曳兩個TextBlock重疊的區域：上層TextBlock被拖動
    // 
    // 結果表明，Phaser引擎已經

    // input.on(Events.POINTER_DOWN, this.onPointerDown.bind(this));
  }

  private onDown(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
    event: Phaser.Types.Input.EventData
  ): void {
    // console.log(`${this.constructor.name}.onDown: ${this.getPointerDragState(pointer)}`);
    this.hasDragged = false;
    this.logBlock(gameObject as TextBlock, "onDown");
    event.stopPropagation();
  }

  private onDragStart(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject
  ): void {
    // console.log(`${this.constructor.name}.onDragStart: ${this.getPointerDragState(pointer)}`);
    this.hasDragged = true;

    // 物理
    const block = gameObject as TextBlock;
    this.logBlock(block, "onDragStart");
    const body = block.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setVelocity(0, 0);
    body.setDirectControl(true);
  }

  private onDrag(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
    dragX: number,
    dragY: number
  ): void {
    const block = gameObject as TextBlock;
    block.setPosition(dragX, dragY);
    // console.log(`${this.constructor.name}.onDrag: ${this.getPointerDragState(pointer)}`);
    this.logBlock(gameObject as TextBlock, "onDrag");
  }

  private onDragEnd(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
    dropped: boolean // 丟在目標物件上了？
  ): void {
    // console.log(`${this.constructor.name}.onDragEnd: ${this.getPointerDragState(pointer)}`);
    this.logBlock(gameObject as TextBlock, "onDragEnd");

    const block = gameObject as TextBlock;
    this.logBlock(block, "onDragStart");
    const body = block.body as Phaser.Physics.Arcade.Body;
    body.setDirectControl(false);
    body.setAllowGravity(true);
    body.setVelocity(
      pointer.velocity.x * 10,
      pointer.velocity.y * 10
    );
  }

  private onUp(
    pointer: Phaser.Input.Pointer,
    gameObject: Phaser.GameObjects.GameObject,
    event: Phaser.Types.Input.EventData
  ): void {
    // console.log(`${this.constructor.name}.onUp: ${this.getPointerDragState(pointer)}`);
    if (!this.hasDragged) { // 物件沒有經歷過拖曳
      //console.log(`${this.constructor.name}.onUp: click!`);
      this.logBlock(gameObject as TextBlock, "onUp, click");
    } else {
      this.logBlock(gameObject as TextBlock, "onUp, dragged");
    }
    this.hasDragged = false;
    event.stopPropagation();
  }

  private onPointerDown(
    pointer: Phaser.Input.Pointer,
    currentlyOver: Phaser.GameObjects.GameObject[]
  ): void {
    console.log(`onPointerDown: ${currentlyOver.length}`);
  }

  private getPointerDragState(pointer: Phaser.Input.Pointer): string {
    const msg = [
      "0 = Not dragging anything",
      "1 = Primary button down and objects below, so collect a draglist",
      "2 = Pointer being checked if meets drag criteria",
      "3 = Pointer meets criteria, notify the draglist",
      "4 = Pointer actively dragging the draglist and has moved",
      "5 = Pointer actively dragging but has been released, notify draglist"
    ];
    return msg[this.scene.input.getDragState(pointer)];
  }

  private logBlock(block: TextBlock, msg: string): void {
    console.log(`TextBlock${block.getId()}: ${msg}`);
  }

/*
  // 使用GAMEOBJECT_開首的事件

  private setupListeners(block: TextBlock) {
    const InputEvents = Phaser.Input.Events;
    block.on(InputEvents.GAMEOBJECT_POINTER_DOWN, this.onDown);
    block.on(InputEvents.GAMEOBJECT_DRAG_START, this.onDragStart);
    block.on(InputEvents.GAMEOBJECT_DRAG, this.onDrag);
  }

  private onDragStart(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
    console.log(`onDragStart: ${dragX}, ${dragY}`);
  }

  private onDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
    // console.log(`onDrag: ${dragX}, ${dragY}`);
    // 使用this時，返還的是TextBlock，而非TextBlockDragController！千萬小心！
    // console.log(`onDrag: ${this.constructor.name}`);
    const block = this as unknown as TextBlock;
    block.setPosition(dragX, dragY);
  }

  private onDown(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    console.log(`onDown: ${localX}, ${localY}`);
  }
*/

}