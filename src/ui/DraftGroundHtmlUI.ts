import DraftGround from '../DraftGround';
import DraftGroundInputValidator from './DraftGroundInputValidator';

export class DraftGroundHtmlUI {
  
  private game: DraftGround;
  private btnCreate: HTMLButtonElement; // 按下：顯示divReset
  private btnReset: HTMLButtonElement;
  private btnCopy: HTMLButtonElement;
  private divCreate: HTMLDivElement;
  private divCreate_textAreaNew: HTMLTextAreaElement;
  private divCreate_btnCreate: HTMLButtonElement;
  private divCreate_btnClear: HTMLButtonElement;
  private divCreate_btnPaste: HTMLButtonElement;
  private inputValidator: DraftGroundInputValidator;

  constructor(game: DraftGround) {
    this.game = game;
    this.btnCreate = this.getElement("btnCreate") as HTMLButtonElement;
    this.btnReset = this.getElement("btnReset") as HTMLButtonElement;
    this.btnCopy = this.getElement("btnCopy") as HTMLButtonElement;
    this.divCreate = this.getElement("divCreate") as HTMLDivElement;
    this.divCreate_textAreaNew = this.getElement("divCreate_textAreaNew") as HTMLTextAreaElement;
    this.divCreate_btnCreate = this.getElement("divCreate_btnCreate") as HTMLButtonElement;
    this.divCreate_btnClear = this.getElement("divCreate_btnClear") as HTMLButtonElement;
    this.divCreate_btnPaste = this.getElement("divCreate_btnPaste") as HTMLButtonElement;
    this.inputValidator = new DraftGroundInputValidator(this.divCreate_btnCreate, this.divCreate_textAreaNew);

    this.btnCreate.addEventListener("click", () => {
      if (this.divCreate.classList.contains("hidden")) {
        this.btnCreate.innerHTML = "-";
        this.divCreate.classList.remove("hidden");
      } else {
        this.btnCreate.innerHTML = "+";
        this.divCreate.classList.add("hidden");
      }
    });

    this.btnReset.addEventListener("click", () => {
      this.game.requestReset();
    });

    this.btnCopy.addEventListener("click", () => {
      this.game.requestCopy();
    });

    this.divCreate_btnClear.addEventListener("click", () => {
      this.divCreate_textAreaNew.value = "";
    });

    this.divCreate_btnPaste.addEventListener("click", async () => {
      try {
        const clipboardText = await this.getClipboardText();
        this.divCreate_textAreaNew.value = clipboardText;
        this.inputValidator.validateAndUpdate();
      } catch {
        alert('无法读取剪贴板');
      }
    });

    this.divCreate_btnCreate.addEventListener("click", ()=> {
      console.log(`btnCreate.click: ${this.divCreate_textAreaNew.value}`);
      this.game.requestCreate(this.divCreate_textAreaNew.value);
      if (this.divCreate.classList.contains("hidden")) {
        this.btnCreate.innerHTML = "-";
        this.divCreate.classList.remove("hidden");
      } else {
        this.btnCreate.innerHTML = "+";
        this.divCreate.classList.add("hidden");
      }
    });

  }

  private getElement(id: string): HTMLElement {
    const ret = document.getElementById(id);
    if (!ret)
      throw new Error(`${id}不存在！`);
    return ret;
  }

  private async getClipboardText(): Promise<string> {
    try {
      // 检查浏览器支持情况
      if (!navigator.clipboard || !navigator.clipboard.readText) {
        throw new Error('浏览器不支持Clipboard API');
      }
      
      // 获取剪贴板文本内容
      const text = await navigator.clipboard.readText();
      return text;
    } catch (err) {
      console.error('无法读取剪贴板:', err);
      
      // 根据错误类型提供更具体的提示
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError') {
          throw new Error('剪贴板访问被拒绝，请授予权限');
        }
        if (err.name === 'DataError') {
          throw new Error('剪贴板数据无法读取');
        }
      }
      
      throw new Error('读取剪贴板失败');
    }
  }

}