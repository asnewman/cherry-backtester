import AlphaVantage from 'alphavantage-ts';
import { avDayDataToDayData, DayData } from './helpers';

export type AVDayData = {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
};

class CherryBacktester {
  ticker: string;
  dailyData: DayData[] | undefined;
  ledger: {
    date: string;
    action: 'buy' | 'sell';
    amount: number;
    success: boolean;
  }[] = [];
  _balance: number;
  _av: AlphaVantage;
  _totalShares = 0;

  constructor(ticker: string, startingBalance: number, avApiKey: string) {
    this.ticker = ticker;
    this._balance = startingBalance;
    this._av = new AlphaVantage(avApiKey);
  }

  async load() {
    const rawDailyData = await this._av.stocks.daily(this.ticker, {
      outputsize: 'full',
      datatype: 'json',
    });

    const dailyData: DayData[] = []
    for (const [date, avData] of Object.entries(rawDailyData["Time Series (Daily)"]).reverse()) {
      dailyData.push(avDayDataToDayData(date, avData as AVDayData))
    }

    this.dailyData = dailyData;
  }

  calculateDaily(
    evaluator: (
      data: DayData[]
    ) => { action: 'buy' | 'sell' | 'nothing'; amount: number }
  ) {
    if (!this.dailyData) {
      throw new Error('Data has not been initialized');
    }

    let idx = 0;
    for (const dayData of this.dailyData) {
      const { action, amount } = evaluator(
        this.dailyData.slice(0, idx + 1)
      );

      idx++;

      if (action === 'nothing') continue;
      else {
        const transactionAmount = dayData.close * amount;
        let success = true;

        if (action === 'buy') {
          if (transactionAmount <= this._balance) {
            this._totalShares += amount;
            this._balance -= transactionAmount;
          } else {
            success = false;
          }
        } else if (action === 'sell') {
          if (amount <= this._totalShares) {
            this._totalShares -= amount;
            this._balance += transactionAmount;
          } else {
            success = false;
          }
        }

        this.ledger.push({ date: dayData.date, action, amount, success });
      }
    }
  }
}

export default CherryBacktester;
