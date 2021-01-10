import { AVDayData } from ".";
import { avDayDataToDayData } from "./helpers";

describe("Helper tests", () => {
  test("Accurately converts AVDayData to DayData", () => {
    const avDayData: AVDayData = {
      "1. open": "23.45",
      "2. high": "27.52",
      "3. low": "22.47",
      "4. close": "26.97",
      "5. volume": "6382381"
    }

    const dayData = avDayDataToDayData("2021-01-08", avDayData);

    expect(dayData.date).toBe("2021-01-08");
    expect(dayData.open).toBe(23.45)
    expect(dayData.high).toBe(27.52)
    expect(dayData.low).toBe(22.47)
    expect(dayData.close).toBe(26.97)
    expect(dayData.volume).toBe(6382381)
  });
});