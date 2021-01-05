import CherryBacktester from '.';

const exampleRawData = {
  '2020-12-31': {
    '1. open': '124.2200',
    '2. high': '126.0300',
    '3. low': '123.9900',
    '4. close': '125.8800',
    '5. volume': '3574696',
  },
  '2020-12-30': {
    '1. open': '123.8000',
    '2. high': '124.8500',
    '3. low': '123.6300',
    '4. close': '124.3400',
    '5. volume': '3380494',
  },
  '2020-12-29': {
    '1. open': '125.3500',
    '2. high': '125.4800',
    '3. low': '123.2400',
    '4. close': '123.8000',
    '5. volume': '3487007',
  },
  '2020-12-28': {
    '1. open': '125.1000',
    '2. high': '126.6000',
    '3. low': '124.4600',
    '4. close': '124.8200',
    '5. volume': '3583222',
  },
  '2020-12-24': {
    '1. open': '125.0000',
    '2. high': '125.1000',
    '3. low': '124.2100',
    '4. close': '124.6900',
    '5. volume': '1761122',
  },
};

describe('Cherry Backtester tests', () => {
  test('Buy works correctly', () => {
    const cb = new CherryBacktester('IBM', 10000, '123');
    cb.dailyData = exampleRawData;

    cb.calculateDaily(data => {
      if (data[data.length - 1][1]['4. close'] === '123.8000') {
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
        data[data.length - 1][1]['4. close'] === '125.8800' ||
        data[data.length - 1][1]['4. close'] === '123.8000'
      ) {
        return {
          action: 'buy',
          amount: 2,
        };
      }

      if (data[data.length - 1][1]['4. close'] === '124.3400') {
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
      if (data[data.length - 1][1]['4. close'] === '123.8000') {
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
      if (data[data.length - 1][1]['4. close'] === '123.8000') {
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
