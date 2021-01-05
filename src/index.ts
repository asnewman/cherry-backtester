import AlphaVantage from 'alphavantage-ts';

type DailyData = {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
};

class CherryBacktester {
  ticker: string;
  dailyData: { [key: string]: any } | undefined;
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

    this.dailyData = rawDailyData['Time Series (Daily)'];
  }

  calculateDaily(
    evaluator: (
      data: [string, DailyData][]
    ) => { action: 'buy' | 'sell' | 'nothing'; amount: number }
  ) {
    if (!this.dailyData) {
      throw new Error('Data has not been initialized');
    }

    const reversedDailyDataEntries = Object.entries(this.dailyData).reverse();

    let idx = 0;
    for (const [date, dayData] of reversedDailyDataEntries) {
      const { action, amount } = evaluator(
        reversedDailyDataEntries.slice(0, idx + 1)
      );

      idx++;

      if (action === 'nothing') continue;
      else {
        const transactionAmount = dayData['4. close'] * amount;
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

        this.ledger.push({ date, action, amount, success });
      }
    }
  }
}

export default CherryBacktester;
