export class ScoreSubmissionHandler {

  private form: HTMLFormElement;
  private inputName: HTMLInputElement;
  private inputTime: HTMLInputElement;
  private inputScore: HTMLInputElement;
  private inputAuth: HTMLInputElement;
  private dummyFrame: HTMLIFrameElement | null = null;

  constructor() {
    this.inputName  = this.getInput("input-name");
    this.inputTime  = this.getInput("input-time");
    this.inputScore = this.getInput("input-score");
    this.inputAuth  = this.getInput("input-auth");
    this.form = document.getElementById("form-sneaky") as HTMLFormElement;

    this.dummyFrame = document.getElementById("dummyFrame") as HTMLIFrameElement;

    this.dummyFrame.addEventListener("load", (e: Event) => {
      if (this.dummyFrame!.src === "about:blank") {
        return;
      } else {
        console.log(`iframe.onload: Record received! ${this.dummyFrame!.innerHTML}`);
        this.dummyFrame!.src = "about:blank";
        this.dummyFrame!.innerHTML = "";
      }
    });

    this.dummyFrame.addEventListener("error", (e: ErrorEvent) => {
      console.log("iframe.onerror: Something went wrong...");
    });
    
    this.form.addEventListener('submit', (e: SubmitEvent) => {
      console.log("form.onsubmit: Record about to be submitted!");
    });
  }

  public setRecord(name: string, score: number, auth: string): void {
    const timestamp = Date.now();
    this.inputName.value = name;
    this.inputTime.value = timestamp.toString();
    this.inputScore.value = score.toString();
    this.inputAuth.value = auth;
  }

  public submit(): void {
    if (!this.form)
      throw new Error("Form doesn't exist!");
    console.log("submit(): submission requested!");
    this.form.requestSubmit();
  }

  private getInput(id: string): HTMLInputElement {
    const ret = document.getElementById(id);
    if (!ret)
      throw new Error(`No such element! ${id}`);
    if (!(ret instanceof HTMLInputElement))
      throw new Error(`Wrong element! ${id}`);
    return ret as HTMLInputElement;
  }

}