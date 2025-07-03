import { GoogleFormSubmissionHandler } from "txs-phaser-core";

export default class SubmissionHandler {

  private _handler: GoogleFormSubmissionHandler;

  constructor() {
    this._handler = new GoogleFormSubmissionHandler(
      "1FAIpQLSdE7Y9V6j596p2Eh-dZdKAftZ1fwG2UT1Gn__v39sM_-9Uc4Q",
      [
        "entry.1733092217",
        "entry.330873632",
        "entry.1548315406",
        "entry.1907891557",
        "entry.1160595417",
        "entry.1319553876",
        "entry.1780192130"
      ]
    );
  }
  
  public submit(name: string, auth: string, score: bigint, audioPlayCount: bigint, data: string, questionSet: string): void {
    this._handler.submit(Date.now().toString(), name, auth, String(score), data, String(audioPlayCount), questionSet);
  }

  public destroy(): void {
    this._handler.destroy();
  }

}