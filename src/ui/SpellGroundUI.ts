import { DictionaryEntry, DictionaryEntryError, ScreenFlash } from "txs-phaser-core";
import SpellGroundMain from "../scenes/SpellGroundMain";
import HealthBar from "./HealthBar";
import { IUserData, UsernameLogger } from "./UsernameLogger";

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
        if (this._audio.paused)
          this._audio.play();
      } else if (this._utterance) { // 沒貨再用Web Speech API
        console.log("由Web Speech API發聲!");
        if (!window.speechSynthesis.speaking)
          window.speechSynthesis.speak(this._utterance);
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

}