import { CameraController, Pool } from 'txs-phaser-core';
import { TextBlock, TextBlockConfig } from "../objects/TextBlock";
import { TextBlockController } from "../control/TextBlockController";
import DraftGround from "../DraftGround";

/**
 * 字塊拖曳工具的入口場景。
 */
export default class DraftScene extends Phaser.Scene {

  /*

  需測試的功能：
  
  ✅能分辨點擊和拖曳TextBlock
  ✅在有物理引擎影響下拖曳並投擲TextBlock
  ✅分析並解決TextBlock之間沒有碰撞的問題：未this.scene.physics.add.collider。
  ✅介面如何處理？從HTML收到用戶的輸入？
  ✅如何從Phaser之中導出內容至設備clipboard
  🟡鏡頭要能夠拖曳移動及縮放
  🟡TextBlock需要能夠在被點擊時循環變色

  */

  /**
   * 控制{@link TextBlock}拖曳和點擊邏輯的控制器。
   * 
   * 於{@link Phaser.Scene#create}內生成，可視為必定存在。
   */
  private textBlockController!: TextBlockController;

  /**
   * 控制單個{@link Phaser.Cameras.Scene2D.Camera}的控制器。
   * 
   * 於{@link Phaser.Scene#create}內生成，可視為必定存在。
   */
  private cameraController!: CameraController;

  /**
   * 裝載{@link TextBlock}對象的池子。
   * 
   * 於{@link DraftGround}構造函數內生成。
   */
  private textBlockPool: Pool<TextBlock, TextBlockConfig>;

  /**
   * 用於設置{@link TextBlock}初始狀態的設定個例。
   * 
   * 改變個例內部的值，然後使用個例作為生成參數。
   */
  private textBlockConfig!: TextBlockConfig;

  /**
   * 儲存所有活躍{@link TextBlock}對象的列陣。
   */
  private textBlocks: TextBlock[];

  /**
   * 生成一個{@link DraftScene}個例。
   * @param config 設定個例
   */
  constructor(config: Phaser.Types.Scenes.SettingsConfig) {
    super(config);
    this.textBlocks = new Array<TextBlock>();
    this.textBlockConfig = {
      scene: this,
      x: 0,
      y: 0,
      text: "",
      draggable: true,
      enablePhysics: true
    };
    this.textBlockPool = new Pool(TextBlock);
  }

  /**
   * 見{@link Phaser.Scene#init}。
   */
  init() {
    const game = (this.game as DraftGround);
    // game.registerCreate(this, this.onRequestCreateByUI);
    // game.registerReset(this, this.onRequestResetByUI);
    // game.registerCopy(this, this.onRequestCopyByUI);
    this.onRequestCreateByUI = this.onRequestCreateByUI.bind(this);
    this.onRequestResetByUI = this.onRequestResetByUI.bind(this);
    this.onRequestCopyByUI = this.onRequestCopyByUI.bind(this);
    game.CreateRequested.on(this.onRequestCreateByUI);
    game.ResetRequested.on(this.onRequestResetByUI);
    game.CopyRequested.on(this.onRequestCopyByUI);
    this.events.on(Phaser.Scenes.Events.DESTROY, this.onSceneDestroy);
  }

  /**
   * 會在用戶通過{@link DraftGroundHtmlUI}的按鈕要求生成新問題時調用。
   * 
   * 我們讓所有{@link TextBlock}回歸池子，依照{@link DraftGroundHtmlUI}提供的問題，重新生成{@link TextBlock}個例。
   * @param sender 遊戲個例
   * @param question 遊戲要求生成的問題
   */
  private onRequestCreateByUI(sender: DraftGround, question: string): void {
    if (question) {
      const parts = question.split("|");
      console.log(`onRequestCreateByUI: ${parts}`);
      this.textBlockPool.put(...this.textBlocks); // 歸池
      this.textBlocks.length = 0; // 清除活躍陣列
      this.createFromParts(parts); // 重新生成
    }
  }

  /**
   * 會在用戶通過{@link DraftGroundHtmlUI}的按鈕要求重置現有{@link TextBlock}時調用。
   * 
   * 我們讓所有{@link TextBlock}重新排列一次。
   * @param sender 遊戲個例
   */
  private onRequestResetByUI(sender: DraftGround): void {
    console.log(`onRequestResetByUI`);
    //this.arrangeTextBlocks(this.textBlocks, this.physics.world.bounds);
    this.arrangeTextBlocks2(this.textBlocks);
  }

  /**
   * 會在用戶通過{@link DraftGroundHtmlUI}的按鈕要求複製現有{@link TextBlock}上的文字時調用。
   * @param sender 遊戲個例
   */
  private async onRequestCopyByUI(sender: DraftGround): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.combineTextBlocks(this.textBlocks));
      alert('复制成功!');
    } catch (error) {
      console.error("複製失敗！", error);
      alert('请手动复制内容');
    }
  }

  private onSceneDestroy(): void {
    console.log(`onSceneDestroy: ${this.constructor.name}`);
    this.events.off(Phaser.Scenes.Events.DESTROY, this.onSceneDestroy);
    const game = this.game as DraftGround;
    game.CreateRequested.off(this.onRequestCopyByUI);
    game.ResetRequested.off(this.onRequestResetByUI);
    game.CopyRequested.off(this.onRequestCopyByUI);
  }

  preload() {
    console.log("preload()");
  }

  create() {
    console.log("create()");

    // 設定場地大小為1200x1200px，初始中心點為(0, 0)
    this.physics.world.setBounds(
      -600, // x
      -600, // y
      1200, // width
      1200, // height
      true, // checkLeft
      true, // checkRight,
      true, // checkUp,
      true, // checkDown
    );

    this.input.addPointer(1); // 本來有mousePointer和一個Pointer可用，現多添加一個
    this.cameraController = new CameraController(
      this,
      this.cameras.main,
      this.input.pointer1,
      this.input.pointer2,
      this.physics.world.bounds
    );
    this.textBlockController = new TextBlockController(this);

    const params = new URLSearchParams(window.location.search);
    const parts = params.get("parts")?.split("|");

    this.createFromParts(parts);

    //const config: Phaser.Types.GameObjects.Group.GroupConfig = {
    //  classType: TextBlock,
    //  runChildUpdate: true
    //}
    //const blocks = this.add.group(config);

    // 以下代碼與this.physics.add.collider的方法不相容
    // 只能二選一
    // 似乎想用collision category便別搞group

    //this.blockGroup = this.physics.add.group({
    //  collideWorldBounds: true,
    //  allowGravity: true,
    //  dragX: 50,
    //  dragY: 50,
    //  bounceX: 0.4,
    //  bounceY: 0.4
    //});
    //this.blockGroup.addMultiple(this.textBlocks);
    //this.physics.add.collider(this.blockGroup, this.blockGroup);
    //Phaser.Types.Physics.Arcade.ArcadeColliderType


    //const blockGroup = this.blockGroup = this.physics.add.group(this.textBlocks);
    //console.log(`blockGroup: ${blockGroup.getLength()}`);

    /*const config: Phaser.Types.Physics.Arcade.PhysicsGroupConfig = {
      collideWorldBounds: true,
      allowGravity: false
    };
    const blockGroup = this.physics.add.group(this.textBlocks, config);
    console.log(this.textBlocks[0].body?.constructor.name);
    this.physics.add.collider(
      blockGroup,
      blockGroup,
      undefined,
      undefined,
      this
    );*/

  }

  /**
   * 生成{@link TextBlock}。
   * @param parts 問題的字塊
   */
  private createFromParts(parts: string[] | undefined) {
    if (parts) {

      const config = this.textBlockConfig;
      for (let i=0; i<parts.length; i++) {
        config.text = parts[i].trim();
        this.textBlocks.push(this.textBlockPool.get(config));
      }
      
      this.physics.add.collider(this.textBlocks, this.textBlocks);

      //this.arrangeTextBlocks(this.textBlocks, this.physics.world.bounds);
      this.arrangeTextBlocks2(this.textBlocks);
    } else {
      console.error("無字塊可生。")
    }
  }

  /**
   * 初始{@link TextBlock}的位置，盡可能將字塊生成在相互不重疊的地方。
   * 
   * 註：DeepSeek🐳寫的。
   * @param texts 字塊陣列
   * @param worldWidth 世界寬度
   * @param worldHeight 世界高度
   * @param options 排列設置，不用碰
   */
  private arrangeTextBlocks(
      texts: Phaser.GameObjects.Text[],
      worldBounds: Phaser.Geom.Rectangle,
      options: {
          maxIterations?: number;
          repulsionForce?: number;
          boundaryForce?: number;
          initialStep?: number;
      } = {}
  ): void {
    // 解构边界参数
    const { width: worldWidth, height: worldHeight } = worldBounds;
    
    // 配置参数（带默认值）
    const {
      maxIterations = 100,
      repulsionForce = 1000,
      boundaryForce = 100,
      initialStep = 10
    } = options;

    // 初始化随机位置
    texts.forEach(text => {
        text.setPosition(
            worldBounds.x + Math.random() * worldWidth,
            worldBounds.y + Math.random() * worldHeight
        );
    });

    // 迭代优化布局
    for (let iter = 0; iter < maxIterations; iter++) {
      const stepSize = initialStep * (1 - iter / maxIterations); // 线性衰减步长
    
      texts.forEach((textA, i) => {
        let totalDx = 0;
        let totalDy = 0;
    
        // 文本间斥力计算
        texts.forEach((textB, j) => {
          if (i === j) return;
          
          const dx = textA.x - textB.x;
          const dy = textA.y - textB.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 0.1;
          
          // 库仑斥力模型 (F = k / r²)
          const force = repulsionForce / (distance * distance);
          totalDx += (dx / distance) * force;
          totalDy += (dy / distance) * force;
        });
    
        // 边界斥力计算
        const distToLeft = textA.x - worldBounds.x;
        const distToRight = worldBounds.right - textA.x;
        const distToTop = textA.y - worldBounds.y;
        const distToBottom = worldBounds.bottom - textA.y;
        
        // 边界斥力模型 (F = k / d²)
        const leftForce = boundaryForce / (distToLeft * distToLeft);
        const rightForce = boundaryForce / (distToRight * distToRight);
        const topForce = boundaryForce / (distToTop * distToTop);
        const bottomForce = boundaryForce / (distToBottom * distToBottom);
        
        totalDx += leftForce - rightForce;
        totalDy += topForce - bottomForce;
    
        // 计算新位置
        const magnitude = Math.sqrt(totalDx * totalDx + totalDy * totalDy) || 1;
        const newX = textA.x + (totalDx / magnitude) * stepSize;
        const newY = textA.y + (totalDy / magnitude) * stepSize;
    
        // 应用新位置（确保在边界内）
        textA.setPosition(
          Math.max(worldBounds.x, Math.min(worldBounds.right, newX)),
          Math.max(worldBounds.y, Math.min(worldBounds.bottom, newY))
        );
      });
    }
  }

  private arrangeTextBlocks2(textBlocks: TextBlock[]): void {
      if (textBlocks.length === 0) {
          return;
      }

      // 所有文本块高度相同，取第一个的高度
      const textHeight = textBlocks[0].height;

      // 按宽度降序排序（优先处理宽文本块）
      textBlocks.sort((a, b) => b.width - a.width);

      // 基础行号循环序列：0（中心行）、1（上）、-1（下）、2（上）、-2（下）
      const CYCLE_BASE = [0, 1, -1, 2, -2];
      const rowNumbers: number[] = [];
      
      // 生成行号序列（循环使用基础序列）
      for (let i = 0; i < textBlocks.length; i++) {
          rowNumbers.push(CYCLE_BASE[i % CYCLE_BASE.length]);
      }

      // 按行号分组文本块
      const rowMap: { [key: number]: TextBlock[] } = {};
      for (let i = 0; i < textBlocks.length; i++) {
          const rowNum = rowNumbers[i];
          if (!rowMap[rowNum]) {
              rowMap[rowNum] = [];
          }
          rowMap[rowNum].push(textBlocks[i]);
      }

      // 处理每一行
      for (const rowNum of Object.keys(rowMap).map(Number)) {
          const blocks = rowMap[rowNum];
          
          // 计算行总宽度（所有块宽 + 间隙）
          let totalRowWidth = 0;
          for (const block of blocks) {
              totalRowWidth += block.width;
          }
          totalRowWidth += 15 * (blocks.length - 1); // 块间间隙
          
          // 设置行起始X位置（使行居中）
          let currentX = -totalRowWidth / 2;
          
          // 放置该行所有文本块
          for (const block of blocks) {
              // 设置文本块中心坐标
              block.x = currentX + block.width / 2;
              block.y = rowNum * (textHeight + 15); // 行间垂直间距
              
              // 更新X位置（当前块右边界 + 间隙）
              currentX += block.width + 15;
          }
      }
  }

  /**
   * 從字塊的位置，推算出用戶想排列出的文字。DeepSeek🐳寫的。
   * @param textBlocks 字塊陣列
   * @returns 從字塊位置推算出來的完整段落
   */
  private combineTextBlocks(textBlocks: TextBlock[]): string {
    if (textBlocks.length === 0) return '';

    // 計算垂直容差（基於平均文字高度）
    const avgHeight = textBlocks.reduce((sum, text) => {
      return sum + (text.height || 30); // 預設高度 30px
    }, 0) / textBlocks.length;
    const tolerance = avgHeight * 0.6; // 使用 60% 高度作為容差範圍

    // 按 Y 軸位置分組行
    const lines: TextBlock[][] = [];
    const sortedByY = [...textBlocks].sort((a, b) => a.y - b.y);

    let currentLine: TextBlock[] = [];
    let referenceY: number | null = null;

    for (const text of sortedByY) {
      const yPos = text.y;
      
      if (referenceY === null) {
        // 第一行初始化
        referenceY = yPos;
        currentLine.push(text);
      } else if (Math.abs(yPos - referenceY) <= tolerance) {
        // 相同行（在容差範圍內）
        currentLine.push(text);
      } else {
        // 新行開始
        lines.push(currentLine);
        currentLine = [text];
        referenceY = yPos;
      }
    }
    lines.push(currentLine); // 添加最後一行

    // 組合結果
    return lines.map(line => {
      // 按 X 位置排序並連接文字
      return line.sort((a, b) => a.x - b.x)
                .map(t => t.text)
                .join(' '); // 加插空格連接
    }).join(' '); // 行間無須用換行符分隔
  }

  /*public update(time: number, delta: number): void {
    this.cameraController.update(time, delta);
  }*/

}
