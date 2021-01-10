import { AVDayData } from "."

export type DayData = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export const avDayDataToDayData = (dateString: string, avDayData: AVDayData): DayData => {
  return {
    date: dateString,
    open: Number(avDayData["1. open"]),
    high: Number(avDayData["2. high"]),
    low: Number(avDayData["3. low"]),
    close: Number(avDayData["4. close"]),
    volume: Number(avDayData["5. volume"])
  }
}