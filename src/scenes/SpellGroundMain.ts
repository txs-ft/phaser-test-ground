import { CameraController, DisplayUtils, DataUtils, TextBlockController, SpellingQuestionSet } from "txs-phaser-core";
import { SpellBlock } from "../objects/SpellBlock";
import { SpellBlockController } from "../objects/SpellBlockController";
import { SpellGroundResult } from "../SpellGroundScore";
import { SpellGroundUI } from "../ui/SpellGroundUI";
import SubmissionHandler from "../SubmissionHandler";

enum SpellGroundState {
  LOADING = "LOADING",
  READY = "READY",
  CHECKING = "CHECKING",
  WIN = "WIN"
}

export default class SpellGroundMain extends Phaser.Scene {

  public static readonly PLAYER_MAX_HP = 10n;

  private _ui: SpellGroundUI;
  private _state: SpellGroundState = SpellGroundState.LOADING;
  private _hp: bigint = SpellGroundMain.PLAYER_MAX_HP;
  
  // 於Phaser.Game.init()中初始化
  
  // 於Phaser.Game.create()中初始化
  private _cameraController!: CameraController;
  private _blockController!: SpellBlockController;
  private _blockGroup!: Phaser.Physics.Arcade.Group;
  private _activeBlocks!: SpellBlock[];
  private _bgGrid!: Phaser.GameObjects.Graphics;
  private _questionSet!: SpellingQuestionSet;
  private _score!: SubmissionHandler;
  
  constructor() {
    super('MainScene');
    this._ui = new SpellGroundUI(this);
  }

  init() {
  }

  create() {

    this.createWorkingArea();

    this.input.addPointer(1);

    this._cameraController = new CameraController(
      this,
      this.cameras.main,
      this.input.pointer1,
      this.input.pointer2,
      this.physics.world.bounds
    );

    this._blockController = new SpellBlockController(this);
    this.onBlocksArranged = this.onBlocksArranged.bind(this);
    this.onFirstInteracted = this.onFirstInteracted.bind(this);
    this._blockController.BlocksArranged.on(this.onBlocksArranged);
    this._blockController.FirstInteracted.on(this.onFirstInteracted);
    this._blockGroup = this.physics.add.group({
      classType: SpellBlock,
      maxSize: 100,
      runChildUpdate: false,
      collideWorldBounds: true,
      allowGravity: false,
      dragX: 16000,
      dragY: 16000,
      bounceX: 0.05,
      bounceY: 0.05
    });
    this.physics.add.collider(this._blockGroup, this._blockGroup);
    this._activeBlocks = [];

    this.setupQuestions();
    this._score = new SubmissionHandler();
    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      this._score.destroy();
    });

    this._state = SpellGroundState.READY;
    
  }

  private createWorkingArea(): void {
    const width = Math.max(this.scale.width * 1.5, 1800);
    const height = Math.max(this.scale.height * 1.5, 1800);
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    // 設定場地大小為瀏覽器場景的150%，初始中心點為(0, 0)
    this.physics.world.setBounds(
      -halfWidth, // x
      -halfHeight, // y
      width, // width
      height, // height
      true, // checkLeft
      true, // checkRight,
      true, // checkUp,
      true
    );

    this._bgGrid = DisplayUtils.createBackgroundGrid(
      this,
      width, height,
      100, 100,
      "#000000", "#404040"
    );
    this._bgGrid.setPosition(-halfWidth, -halfHeight);

  }

  private setupQuestions(): void {
    const param = new URLSearchParams(window.location.search);
    const q = param.get("q"); // 來自 https://...?q=PWOEFJPSDO
    if (q) {
      // URL提供了題目
      const qs = atob(q).split("|");
      const setName = param.get("set") ?? "unknown";
      const shuffle = param.get("shuffle") ? Boolean(param.get("shuffle")) : false;
      this._questionSet = new SpellingQuestionSet(qs, setName, shuffle);
      this._ui.word = this._questionSet.current;
    } else {
      // URL沒有提供題目
      this._ui.word = "quality";
      this._questionSet = new SpellingQuestionSet(["quality", "adventure"], "default", false);
    }
    this.createPhonemes(this._questionSet.current.split(""));
  }

  private createPhonemes(phonemes: string[]): void {
    for (const phoneme of phonemes) {
      const block = this._blockGroup.get() as SpellBlock;
      block.initialize(phoneme.trim());
      // block.initializePhonemeBlock(???, phoneme.trim());
      this._activeBlocks.push(block);
    }
    DataUtils.shuffleArrayInPlace(this._activeBlocks);
    this.arrangeBlocksInSpiral(this._activeBlocks);
  }
  
  private arrangeBlocksInSpiral(blocks: SpellBlock[]) {
    const spiralCenterX = 0;
    const spiralCenterY = 0;

    // 如果没有方块，直接返回
    if (blocks.length === 0) return;

    // 1. 计算所有方块的最大尺寸（用于确定步长）
    let maxBlockWidth = 0;
    let maxBlockHeight = 0;
    for (const block of blocks) {
        if (block.width > maxBlockWidth) maxBlockWidth = block.width;
        if (block.height > maxBlockHeight) maxBlockHeight = block.height;
    }
    
    // 2. 计算基础步长（最大尺寸 + 最小间距）
    const step = Math.max(maxBlockWidth, maxBlockHeight) + 15;

    // 3. 初始化螺旋参数
    let currentX = spiralCenterX;
    let currentY = spiralCenterY;
    let currentSegmentLength = 1;   // 当前边的长度（方块数量）
    let segmentSteps = 0;           // 当前边已放置的方块计数
    let directionIndex = 0;         // 当前方向索引（0:右,1:上,2:左,3:下）
    let directionChanges = 0;       // 方向改变次数（用于判断何时增加边长）

    // 4. 方向向量：右 -> 上 -> 左 -> 下
    const directions = [
        { x: 1, y: 0 },  // 右
        { x: 0, y: -1 }, // 上
        { x: -1, y: 0 }, // 左
        { x: 0, y: 1 }   // 下
    ];

    // 5. 放置第一个方块（中心点）
    blocks[0].setPosition(currentX, currentY);
    segmentSteps = currentSegmentLength; // 标记第一条边"已用完"

    // 6. 从第二个方块开始螺旋排列
    for (let i = 1; i < blocks.length; i++) {
        // 检查是否需要改变方向（当前边已放满）
        if (segmentSteps >= currentSegmentLength) {
            // 改变方向
            directionIndex = (directionIndex + 1) % 4;
            directionChanges++;
            segmentSteps = 0; // 重置当前边计数器

            // 每改变两次方向增加一次边长
            if (directionChanges % 2 === 0) {
                currentSegmentLength++;
            }
        }

        // 按当前方向移动步长
        currentX += directions[directionIndex].x * step;
        currentY += directions[directionIndex].y * step;

        // 放置方块
        blocks[i].setPosition(currentX, currentY);
        segmentSteps++;
    }
  }

  private onFirstInteracted(sender: TextBlockController<SpellBlock>): void {
    sender.FirstInteracted.off(this.onFirstInteracted);
    if (!this._questionSet.hasStarted)
      this._questionSet.startTimer();
  }

  public mergeBlocks() {
    if (this._state !== SpellGroundState.READY)
      return;
    if (!this._questionSet.hasStarted)
      this._questionSet.startTimer();
    this._blockController.arrangeBlocks(this._activeBlocks, 0, 1000);
    this._cameraController.autoPan(0, 0, 1000, Phaser.Math.Easing.Cubic.Out);
    this._state = SpellGroundState.CHECKING;
  }

  private onBlocksArranged(sender: SpellBlockController, blocks: SpellBlock[]): void {
    if (this._state === SpellGroundState.CHECKING) {
      this.checkAnswer();
    }
  }

  private checkAnswer(): void {
    // 1. 按当前X坐标排序（从左到右）
    const sortedBlocks = [...this._activeBlocks].sort((a, b) => 
      a.x - b.x
    );
    let answer = "";
    for (const block of sortedBlocks) {
      block.isHighlighted = false;
      answer += block.text;
    }
    if (this._questionSet.check(answer)) {
      // 正確！
      console.log(`${this.constructor.name}.checkAnswer: 答案"${answer}"正確！✅`);
      this._ui.flashGreen();
      if (this._questionSet.next()) {
        this._state = SpellGroundState.READY;
        for (const block of this._activeBlocks) {
          this._blockGroup.killAndHide(block);
        }
        this._activeBlocks.length = 0;
        this.createPhonemes(this._questionSet.current.split(""));
        this._ui.word = this._questionSet.current;
      } else {
        this._state = SpellGroundState.WIN;
        this._blockController.setActive(false);
        this._cameraController.setActive(false);
        this._questionSet.endTimer();
        const userData = this._ui.userData;
        if (userData) {
          // 有邀請碼才發分數
          const endScore = this._hp * BigInt(this._questionSet.size);

          const result = this._questionSet.generateResult();
          // console.log("result");
          // console.log(result);
          // console.log("result.toJson()");
          // console.log(result.toJson());
          // console.log("JSON.stringify(result.toJson())");
          // console.log(JSON.stringify(result.toJson()));
          
          const json = result.toJson();
          this._score.submit(userData.name, userData.invitationCode, endScore, this._ui.audioPlayCount, JSON.stringify(json), this._questionSet.name);

          this._ui.showResult(userData.name, json, this._hp, this._ui.audioPlayCount);
        }
      }
    } else {
      // 錯誤！
      console.log(`${this.constructor.name}.checkAnswer: 答案"${answer}"錯誤！❌`);
      this._blockController.arrangeBlocks(this._activeBlocks, 15, 500);
      this.giveHints(sortedBlocks, this._questionSet.current);
      this._ui.flashRed();
      this._state = SpellGroundState.READY;
      if (this._hp > 1)
        this._hp--;
      this._ui.hp = this._hp;
    }
  }

  private giveHints(orderedBlocks: SpellBlock[], correctAnswer: string): boolean {
    // Step 1: 將正確答案轉換為音素數組 (使用預定義的拆分邏輯)
    const correctPhonemes = this.splitWordToPhonemes(correctAnswer);
    
    // Step 2: 提取學生答案的音素序列
    const studentPhonemes = orderedBlocks.map(block => block.text);
    
    // Step 3: 初始化DP表 (二維數組)
    const dp: number[][] = Array.from({ length: studentPhonemes.length + 1 }, () => 
      new Array(correctPhonemes.length + 1).fill(0)
    );
    
    // Step 4: 填充DP表 (計算LCS長度)
    for (let i = 1; i <= studentPhonemes.length; i++) {
      for (let j = 1; j <= correctPhonemes.length; j++) {
        if (studentPhonemes[i - 1] === correctPhonemes[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    
    // Step 5: 回溯標記匹配位置
    const matchedPositions: boolean[] = new Array(studentPhonemes.length).fill(false);
    let i = studentPhonemes.length;
    let j = correctPhonemes.length;
    
    while (i > 0 && j > 0) {
      if (studentPhonemes[i - 1] === correctPhonemes[j - 1]) {
        matchedPositions[i - 1] = true; // 標記匹配位置
          i--;
          j--;
      } else if (dp[i - 1][j] > dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    
    // Step 6: 高亮錯誤位置並檢查完全正確
    let isPerfectMatch = true;
    
    // 檢查長度是否匹配
    if (studentPhonemes.length !== correctPhonemes.length) {
      isPerfectMatch = false;
    }
    
    // 標記所有未匹配的音素塊
    for (let idx = 0; idx < orderedBlocks.length; idx++) {
      if (!matchedPositions[idx]) {
        orderedBlocks[idx].isHighlighted = true;
        isPerfectMatch = false; // 有任何不匹配就不是完美匹配
      }
    }
    
    return isPerfectMatch;
  }

  // 輔助函數：將單詞拆分為音素數組 (需根據遊戲邏輯實現)
  private splitWordToPhonemes(word: string): string[] {
    return word.split("");
  }
    

}