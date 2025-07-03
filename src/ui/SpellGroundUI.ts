import { DictionaryEntry, DictionaryEntryError, ScreenFlash, SpellingQuestionSetResultJson } from "txs-phaser-core";
import SpellGroundMain from "../scenes/SpellGroundMain";
import HealthBar from "./HealthBar";
import { IUserData, UsernameLogger } from "./UsernameLogger";
import { SpellGroundResult } from "../SpellGroundScore";

export class SpellGroundUI {

  private _scene: SpellGroundMain;
  private _word: string | null = null;
  private _utterance: SpeechSynthesisUtterance | null;
  private _audio: HTMLAudioElement;
  private _entry: DictionaryEntry = new DictionaryEntry();
  private _entryAudioAvailable: boolean = false;
  private _flash: ScreenFlash;
  private _healthBar: HealthBar;
  private _usernameLogger: UsernameLogger;
  private _audioPlayCount = 0n;
  
  public get audioPlayCount(): bigint { return this._audioPlayCount; }

  private set audioPlayCount(value: bigint) { this._audioPlayCount = value; }

  public get word() : string | null {
    return this._word;
  }
  
  /**
   * [set]改變UI將要念出來的單詞。
   * 
   * 若Web Speech API可用，會同步改變UI將會讀的單詞。
   * 
   * 若自家庫中有這個單詞的檔案，也會同步更新DictionaryEntry。
   */
  public set word(value: string | null) {
    this._word = value;
    if (this._utterance) {
      this._utterance.text = value ?? "Initiate!";
    }
    // set audio
    const url = `https://txs-ft.github.io/fun-learning-collection/dictionary/data/${value}.json`;
    this._entry.load(url).then((entry) => {
      this._entryAudioAvailable = false;
      this._audio.src = `https://dictionary.cambridge.org/${entry.getRandomAudioURL()}`;
    }).catch (error => {
      if (error instanceof DictionaryEntryError) {
        console.error(`${this.constructor.name}載入失敗（DictionaryEntryErrorCode.${error.code}）。原因：`, error);
      } else {
        console.error(`${this.constructor.name}未知錯誤：`, error);
      }
    });

  }

  constructor(scene: SpellGroundMain) {
    this._scene = scene;

    this.onSpeak = this.onSpeak.bind(this);
    this.onMerge = this.onMerge.bind(this);

    this.getButton("btn-speak").addEventListener("click", this.onSpeak);
    this.getButton("btn-merge").addEventListener("click", this.onMerge);

    this._audio = document.createElement("audio");
    this._audio.style.display = "none";
    this._audio.onloadeddata = (e) => {
      console.log("成功載入DictionaryEntry的聲源！");
      this._entryAudioAvailable = true;
    }
    this._audio.onerror = (e) => {
      console.error(e);
      this._entryAudioAvailable = false;
    };

    document.body.appendChild(this._audio);

    this._flash = new ScreenFlash(1500n);
    this._healthBar = new HealthBar(SpellGroundMain.PLAYER_MAX_HP, 1600n);
    this._usernameLogger = new UsernameLogger(1700n, 500);
    this._usernameLogger.tryPromptUser();

    if ('speechSynthesis' in window) {
      this.onWebSpeechError = this.onWebSpeechError.bind(this);
      const u = this._utterance = new SpeechSynthesisUtterance("Initiated!");
      u.lang = "en-US";
      u.rate = 1.0;
      u.pitch = 1.0;
      u.onerror = this.onWebSpeechError;
    } else {
      this._utterance = null;
      this.logErrorNotSupported();
    }

  }

  private onSpeak(e: MouseEvent): void {

    if (this.word) {

      if (this._entry.isLoaded && this._entryAudioAvailable) { // 先看DictionEntry有沒有貨
        console.log("由DictionaryEntry發聲!")
        if (this._audio.paused) {
          this._audio.play();
          this.audioPlayCount++;
        }
      } else if (this._utterance) { // 沒貨再用Web Speech API
        console.log("由Web Speech API發聲!");
        if (!window.speechSynthesis.speaking) {
          window.speechSynthesis.speak(this._utterance);
          this.audioPlayCount++;
        }
      } else  { // 什麼都沒有，肯定發生大事了！
        console.error(`嘗試播放${this.word}時出錯了。事發時entry.url為：${this._entry.url}`);
        console.error(this._entry);
      }

    } else {
      console.warn(`${this.constructor.name}: 用戶要求發音，但word的值是null！`);
      if (this._utterance) {
        if (!window.speechSynthesis.speaking)
          window.speechSynthesis.speak(this._utterance);
      } else {
        this.logErrorNotSupported();
      }
    }
  }

  private logErrorNotSupported(): void {
    console.error(`瀏覽器不支援Web Speech API。你正在使用的瀏覽器為：App Code Name: ${navigator.appCodeName}\nApp Name: ${navigator.appName}\nApp version: ${navigator.appVersion}\nUser agent: ${navigator.userAgent}\nPlatform: ${navigator.platform}`)
  }

  private onWebSpeechError(e: SpeechSynthesisErrorEvent): void {
    console.error(e.error);
    /*

    canceled
    A SpeechSynthesis.cancel method call caused the SpeechSynthesisUtterance to be removed from the queue before it had begun being spoken.

    interrupted
    A SpeechSynthesis.cancel method call caused the SpeechSynthesisUtterance to be interrupted after it had begun being spoken and before it completed.

    audio-busy
    The operation couldn't be completed at this time because the user-agent couldn't access the audio output device (for example, the user may need to correct this by closing another application.)

    audio-hardware
    The operation couldn't be completed at this time because the user-agent couldn't identify an audio output device (for example, the user may need to connect a speaker or configure system settings.)

    network
    The operation couldn't be completed at this time because some required network communication failed.

    synthesis-unavailable
    The operation couldn't be completed at this time because no synthesis engine was available (For example, the user may need to install or configure a synthesis engine.)

    synthesis-failed
    The operation failed because the synthesis engine raised an error.

    language-unavailable
    No appropriate voice was available for the language set in SpeechSynthesisUtterance.lang. You can use the window.speechSynthesis.getVoices() method to determine which voices and languages are supported in the user's browser.

    voice-unavailable
    The voice set in SpeechSynthesisUtterance.voice was not available.

    text-too-long
    The contents of the SpeechSynthesisUtterance.text attribute was too long to synthesize.

    invalid-argument
    The content of the SpeechSynthesisUtterance.rate, SpeechSynthesisUtterance.pitch or SpeechSynthesisUtterance.volume property was not valid.

    not-allowed
    The operation's start was not allowed.

    */
  }

  private onMerge(e: MouseEvent): void {
    this._scene.mergeBlocks();
  }

  private getButton(id: string): HTMLButtonElement {
    const ret = document.getElementById(id) as HTMLButtonElement;
    if (ret)
      return ret;
    throw new Error(`${this.constructor.name}: 找不到${id}`);
  }

  public flashRed(): void {
    this._flash.flash("#ff0000", 0.8, 500);
  }

  public flashGreen(): void {
    this._flash.flash("#00ff00", 0.8, 500);
  }

  public set hp(value: bigint) {
    this._healthBar.hp = value;
  }

  public get userData(): IUserData | null {
    return this._usernameLogger.userData;
  }

public showResult(name: string, result: SpellingQuestionSetResultJson, hpLeft: bigint, audioPlayCount: bigint) {
    // 移除可能已存在的旧结果面板
    const existingPanel = document.getElementById('result-panel');
    if (existingPanel) existingPanel.remove();

    // 计算面板宽度（响应式）
    const isPortrait = window.innerWidth <= window.innerHeight;
    const panelWidth = isPortrait ? '100%' : '60%';
    
    // 创建主容器
    const panel = document.createElement('div');
    panel.id = 'result-panel';
    panel.style.cssText = `
        position: fixed;
        top: 0;
        left: 100%; /* 初始在屏幕右侧外部 */
        width: ${panelWidth};
        height: 100%;
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        color: white;
        box-shadow: -5px 0 25px rgba(0,0,0,0.3);
        padding: 20px;
        box-sizing: border-box;
        overflow-y: auto;
        z-index: 10000;
        transition: transform 0.7s cubic-bezier(0.22, 0.61, 0.36, 1);
        font-family: 'Comic Sans MS', cursive, sans-serif;
    `;

    // 计算分数和耗时
    const totalQuestions = result.questionResults.length;
    const score = Number(hpLeft) * totalQuestions;
    const timeTaken = this.formatTime(result.endTime - result.startTime);

    // 添加内容
    panel.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="font-size: 2.5em; margin-bottom: 5px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">🎉 ${name} 的成绩单 🎉</h1>
            <div style="background: rgba(255,255,255,0.15); border-radius: 16px; padding: 15px; margin: 20px 0;">
                <p style="font-size: 1.2em; margin: 10px 0;">分数公式: 剩余🧡 × 题目数量</p>
                <p style="font-size: 1.8em; font-weight: bold; margin: 15px 0;">
                    ${Number(hpLeft)} × ${totalQuestions} = <span style="color:#FFD700;">${score} 分</span>
                </p>
                <div style="display: flex; justify-content: center; gap: 10px; margin-top: 10px;">
                    <span style="background: rgba(0,0,0,0.2); padding: 8px 15px; border-radius: 20px;">
                        ⏱️ ${timeTaken}
                    </span>
                    <span style="background: rgba(0,0,0,0.2); padding: 8px 15px; border-radius: 20px;">
                        🔊 ${Number(audioPlayCount)} 次发音
                    </span>
                </div>
            </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); border-radius: 12px; padding: 15px;">
            <h2 style="text-align: center; margin-top: 0;">📝 答题详情</h2>
            <div id="attempts-container" style="display: grid; gap: 15px;"></div>
        </div>
    `;

    // 添加答题详情
    const attemptsContainer = panel.querySelector('#attempts-container')!;
    result.questionResults.forEach((qr, index) => {
        const attemptCard = document.createElement('div');
        attemptCard.style.cssText = `
            background: rgba(255,255,255,0.15);
            border-radius: 12px;
            padding: 15px;
            backdrop-filter: blur(10px);
        `;
        
        let attemptsHTML = '';
        qr.attempts.forEach((attempt, i) => {
            const isCorrect = i === qr.attempts.length - 1;
            attemptsHTML += `
                <div style="display: flex; align-items: center; margin: 8px 0;">
                    <span style="width: 30px; height: 30px; border-radius: 50%; 
                           background: ${isCorrect ? '#4CAF50' : '#FF5252'};
                           display: flex; align-items: center; justify-content: center;
                           margin-right: 10px;">
                        ${isCorrect ? '✓' : '✗'}
                    </span>
                    <span style="font-size: 1.1em;">${attempt.answer}</span>
                </div>
            `;
        });

        attemptCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3 style="margin: 0; font-size: 1.3em;">题目 ${index + 1}: ${qr.question}</h3>
                <span style="background: rgba(0,0,0,0.3); padding: 3px 10px; border-radius: 12px;">
                    ${qr.attempts.length} 次尝试
                </span>
            </div>
            <div style="margin-top: 12px;">${attemptsHTML}</div>
        `;
        
        attemptsContainer.appendChild(attemptCard);
    });

    // 添加关闭按钮
    const closeButton = document.createElement('div');
    closeButton.innerHTML = '✕';
    closeButton.style.cssText = `
        position: absolute;
        top: 15px;
        left: 15px;
        width: 40px;
        height: 40px;
        background: rgba(255,255,255,0.2);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5em;
        cursor: pointer;
        transition: all 0.3s;
    `;
    closeButton.onclick = () => {
        panel.style.transform = 'translateX(0)';
        setTimeout(() => panel.remove(), 700);
    };
    panel.appendChild(closeButton);

    // 添加到DOM
    document.body.appendChild(panel);

    // 计算需要向左移动的距离（面板宽度）
    const moveDistance = isPortrait ? '100%' : `${panel.offsetWidth}px`;
    
    // 滑动进入动画
    setTimeout(() => {
        panel.style.transform = `translateX(-${moveDistance})`;
    }, 50);
}

private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}分${seconds.toString().padStart(2, '0')}秒`;
}

}