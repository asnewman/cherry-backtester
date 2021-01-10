import CherryBacktester from '.';
import { DayData } from './helpers';

const exampleRawData: DayData[] = [
  {
    date: '2020-12-24',
    open: 125,
    high: 125.1,
    low: 124.21,
    close: 124.69,
    volume: 1761122,
  },
  {
    date: "2020-12-28",
    open: 125.1,
    high: 126.6,
    low: 124.46,
    close: 124.82,
    volume: 3583222,
  },
  {
    date: "2020-12-29",
    open: 125.35,
    high: 125.48,
    low: 123.24,
    close: 123.8,
    volume: 3487007,
  },
  {
    date: "2020-12-30",
    open: 123.8,
    high: 124.85,
    low: 123.63,
    close: 124.34,
    volume: 3380494,
  },
  {
    date: "2020-12-31",
    open: 124.22,
    high: 126.03,
    low: 123.99,
    close: 125.88,
    volume: 3574696,
  },
]

describe('Cherry Backtester tests', () => {
  test('Buy works correctly', () => {
    const cb = new CherryBacktester('IBM', 10000, '123');
    cb.dailyData = exampleRawData;

    cb.calculateDaily(data => {
      if (data[data.length - 1].close === 123.8) {
        return {
          action: 'buy',
          amount: 2,
        };
      }

      return {
        action: 'nothing',
        amount: 0,
      };
    });

    expect(cb._balance).toBe(9752.4);
    expect(cb._totalShares).toBe(2);
    expect(cb.ledger.length).toBe(1);
    expect(cb.ledger[0].action).toBe('buy');
    expect(cb.ledger[0].amount).toBe(2);
    expect(cb.ledger[0].date).toBe('2020-12-29');
    expect(cb.ledger[0].success).toBe(true);
  });

  test('Buy and sell works correctly', () => {
    const cb = new CherryBacktester('IBM', 10000, '123');
    cb.dailyData = exampleRawData;

    cb.calculateDaily(data => {
      if (
        data[data.length - 1].close === 125.88 ||
        data[data.length - 1].close === 123.8
      ) {
        return {
          action: 'buy',
          amount: 2,
        };
      }

      if (data[data.length - 1].close === 124.34) {
        return {
          action: 'sell',
          amount: 1,
        };
      }

      return {
        action: 'nothing',
        amount: 0,
      };
    });

    expect(cb._balance).toBe(9624.98);
    expect(cb._totalShares).toBe(3);
    expect(cb.ledger.length).toBe(3);
    expect(cb.ledger[0].action).toBe('buy');
    expect(cb.ledger[0].amount).toBe(2);
    expect(cb.ledger[0].date).toBe('2020-12-29');
    expect(cb.ledger[0].success).toBe(true);
    expect(cb.ledger[1].action).toBe('sell');
    expect(cb.ledger[1].amount).toBe(1);
    expect(cb.ledger[1].date).toBe('2020-12-30');
    expect(cb.ledger[1].success).toBe(true);
    expect(cb.ledger[2].action).toBe('buy');
    expect(cb.ledger[2].amount).toBe(2);
    expect(cb.ledger[2].date).toBe('2020-12-31');
    expect(cb.ledger[2].success).toBe(true);
  });

  test('Fails to buy, not enough funds', () => {
    const cb = new CherryBacktester('IBM', 10000, '123');
    cb.dailyData = exampleRawData;

    cb.calculateDaily(data => {
      if (data[data.length - 1].close === 123.8) {
        return {
          action: 'buy',
          amount: 99999,
        };
      }

      return {
        action: 'nothing',
        amount: 0,
      };
    });

    expect(cb._balance).toBe(10000);
    expect(cb._totalShares).toBe(0);
    expect(cb.ledger.length).toBe(1);
    expect(cb.ledger[0].action).toBe('buy');
    expect(cb.ledger[0].amount).toBe(99999);
    expect(cb.ledger[0].date).toBe('2020-12-29');
    expect(cb.ledger[0].success).toBe(false);
  });

  test('Fails to sell, not enough stock', () => {
    const cb = new CherryBacktester('IBM', 10000, '123');
    cb.dailyData = exampleRawData;

    cb.calculateDaily(data => {
      if (data[data.length - 1].close === 123.8) {
        return {
          action: 'sell',
          amount: 99999,
        };
      }

      return {
        action: 'nothing',
        amount: 0,
      };
    });

    expect(cb._balance).toBe(10000);
    expect(cb._totalShares).toBe(0);
    expect(cb.ledger.length).toBe(1);
    expect(cb.ledger[0].action).toBe('sell');
    expect(cb.ledger[0].amount).toBe(99999);
    expect(cb.ledger[0].date).toBe('2020-12-29');
    expect(cb.ledger[0].success).toBe(false);
  });
});
