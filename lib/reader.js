const { Reader } = require('@synonymdev/feeds')

class BitcoinPriceFeedReader extends Reader {
  /**
   * Read the latest price of trading pair.
   *
   * @param {Pair} pair
   * @returns {Promise<number | null>}
   */
  getLatestPrice (pair) {
    return this.getField(pair + '-last')
  }

  /**
   * Read the latest price of trading pair in the format.
   *
   * @param {Pair} pair
   * @returns {Promise<TimestampedPrice | null>}
   */
  async getLatestPriceTimestamped (pair) {
    const response = await this.getField(pair + '-timestamped_price')

    return response
      ? {
          timestamp: response[0],
          price: Number(response[1])
        }
      : null
  }

  /**
   * Read the daily candles of a trading pair.
   *
   * @param {Pair} pair
   * @returns {Promise<Candle[] | null>}
   */
  async getPastDayCandles (pair) {
    const response = await this.getField(pair + '-1D')

    return response ? response.map(mapCandle) : null
  }

  /**
   * Read the weekly candles of a trading pair.
   *
   * @param {Pair} pair
   * @returns {Promise<Candle[] | null>}
   */
  async getPastWeekCandles (pair) {
    const response = await this.getField(pair + '-1W')

    return response ? response.map(mapCandle) : null
  }

  /**
   * Read the weekly candles of a trading pair.
   *
   * @param {Pair} pair
   * @returns {Promise<Candle[] | null>}
   */
  async getPastMonthCandles (pair) {
    const response = await this.getField(pair + '-1M')

    return response ? response.map(mapCandle) : null
  }
}

/** @param {Array<number>} c */
function mapCandle (c) {
  return {
    timestamp: c[0],
    open: c[1],
    close: c[2],
    high: c[3],
    low: c[4],
    volume: c[5]
  }
}

module.exports = BitcoinPriceFeedReader

/**
 * @typedef {'BTCUSD'} Pair
 * @typedef {{
 *  price: number,
 *  timestamp: number
 * }} TimestampedPrice
 * @typedef {{
 *  timestamp: number,
 *  open: number,
 *  close: number,
 *  high: number,
 *  low: number,
 *  volume: number,
 * }} Candle
 */
