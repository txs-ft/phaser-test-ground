import { GoogleFormSubmissionHandler } from "txs-phaser-core";

/**
 * 拼字游戏学生单次作答记录
 */
export namespace SpellGroundScore {
  /**
   * 单次作答记录实体类
   */
  export class Entry {
    /**
     * 学生作答的时间（相对于游戏开始的毫秒数）
     */
    time: number;
  
    /**
     * 学生提交的答案
     */
    answer: string;
  
    /**
     * 创建作答记录
     * @param time 作答耗时（毫秒）
     * @param answer 提交的答案
     */
    constructor(time: number, answer: string) {
      this.time = time;
      this.answer = answer;
    }
  }

  /**
   * 拼字游戏成绩管理器
   */
  export class Manager {
    private _startTime: number = 0;
    private _entries: Entry[] = [];
    private _endTime: number = 0;
    private _active: boolean = false;

    /**
     * 开始游戏计时器
     * @throws 如果游戏已经开始则抛出错误
     */
    startTimer(): void {
      if (this._active) {
        throw new Error('游戏计时器已经开始');
      }
      this._startTime = Date.now();
      this._active = true;
    }

    /**
     * 提交学生作答尝试
     * @param trial 学生提交的答案
     * @throws 如果游戏未开始或已结束则抛出错误
     */
    try(trial: string): void {
      if (!this._active) {
        throw new Error('游戏尚未开始');
      }
      if (this._endTime > 0) {
        throw new Error('游戏已结束，无法提交新答案');
      }

      const currentTime = Date.now();
      const elapsedTime = currentTime - this._startTime;
      this._entries.push(new Entry(elapsedTime, trial));
    }

    /**
     * 结束游戏计时器
     * @throws 如果游戏未开始或已结束则抛出错误
     */
    endTimer(): void {
      if (!this._active) {
        throw new Error('游戏尚未开始');
      }
      if (this._endTime > 0) {
        throw new Error('游戏已结束');
      }

      this._endTime = Date.now();
      this._active = false;
    }

    /**
     * 将成绩数据转换为JSON字符串
     * @returns 包含所有游戏数据的JSON字符串
     * @throws 如果游戏未结束则抛出错误
     */
    toJson(): string {
      if (this._active || this._endTime === 0) {
        throw new Error('游戏尚未结束，无法生成成绩数据');
      }

      return JSON.stringify({
        startTime: this._startTime,
        endTime: this._endTime,
        totalDuration: this._endTime - this._startTime,
        attempts: this._entries.length,
        entries: this._entries.map(entry => ({
          time: entry.time,
          answer: entry.answer
        }))
      });
    }
    
    submit(name: string, auth: string, bonus: bigint) {
      /*
      */
     const handler = new GoogleFormSubmissionHandler(
      "1FAIpQLSdE7Y9V6j596p2Eh-dZdKAftZ1fwG2UT1Gn__v39sM_-9Uc4Q",
      [
        "entry.1733092217",
        "entry.330873632",
        "entry.1548315406",
        "entry.1907891557",
        "entry.1160595417"
      ]);
      handler.submit(Date.now().toString(), name, auth, String(bonus), this.toJson());

      /*
      */
    }

    
    /**
     * 是否已經啟動？
     */
    public get isActive(): boolean {
      return this._active;
    }

    /**
     * 获取学生开始游戏的时间戳
     */
    public get startTime(): number {
      return this._startTime;
    }

    /**
     * 获取学生作答记录
     * @description 最后一个条目必定是正确答案
     */
    public get entries(): Entry[] {
      return [...this._entries]; // 返回副本防止外部修改
    }

    /**
     * 获取学生结束游戏的时间戳
     */
    public get endTime(): number {
      return this._endTime;
    }
  }
}