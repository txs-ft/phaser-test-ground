export class GoogleFormSubmissionHandler {

  private form: HTMLFormElement;
  private entries: HTMLInputElement[];
  private dummyFrame: HTMLIFrameElement;

  constructor(
    formAction: string,
    entryNames: string[]
  ) {
    this.form = this.createForm(formAction);
    this.entries = this.createEntries(entryNames);
    this.dummyFrame = this.createDummyFrame();
  }
  
  private createForm(formAction: string): HTMLFormElement {
    const form = document.createElement('form');
    
    return form;
  }
  createEntries(entryNames: string[]): HTMLInputElement[] {
    throw new Error("Method not implemented.");
  }
  createDummyFrame(): HTMLIFrameElement {
    throw new Error("Method not implemented.");
  }

}