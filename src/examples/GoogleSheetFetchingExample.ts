import { DateUtils, GoogleSheetUtils, SheetResponse } from "txs-phaser-core";

export class GoogleSheetFetchingExample {

  async run(): Promise<SheetResponse> {
    const sheetId = "15Xr7YqTwrdAcI-IVVYDSfDrbKWXR59xKyDwN1btNU5k";
    const sheetName = encodeURIComponent("main");
    const query = `SELECT * WHERE B > ${DateUtils.stringToTime("1991-01-01-00-00-00")}`;

    const promise = GoogleSheetUtils.getRawSheetData(sheetId, sheetName, query);

    promise.then(
      (data: SheetResponse) => {
        console.log(data);
      },
      (reason: any) => {
        console.error(reason);
      }
    )

    return promise;
    
    /* // 使用await的寫法
    try {
      const data: SheetResponse = await GoogleSheetUtils.getRawSheetData(
        sheetId,
        sheetName,
        query
      );
      console.log(data);
    } catch (error) {
      console.error(`Error: ${error}`);
    }*/
  }
  
}