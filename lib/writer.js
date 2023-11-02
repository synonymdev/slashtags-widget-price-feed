const { Feed } = require('@synonymdev/feeds')
const fetch = require('node-fetch')
const { nextTick } = require('process')

const MINUTE = 1000 * 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24
const WEEK = DAY * 24
const MONTH = DAY * 30

const INTERVAL = MINUTE // every 1 minute

class BitcoinPriceFeed extends Feed {
  /**
   * @param {ConstructorParameters<typeof Feed>[0]} client
   * @param {ConstructorParameters<typeof Feed>[1]} config
   * @param {ConstructorParameters<typeof Feed>[2]} opts
   */
  constructor (client, config, opts) {
    super(client, config, opts)

    this._config = config

    // Time since start
    this._age = -1

    // Start on next tick, allowing mocking some methods in unit test after construction.
    nextTick(() => {
      this.onInterval()
      this._interval = setInterval(this.onInterval.bind(this), INTERVAL)
    })
  }

  async start () { }

  async onInterval () {
    if (this._age === -1) {
      this._age = 0
    } else {
      this._age += INTERVAL
    }

    // Do all the live prices - these are high priority, so do them all first
    for (const ticker of this._config.fields) {
      // @ts-ignore
      this._updateLivePrice(ticker)
    }

    // Do the hourly, weekly and monthly feeds
    // time to do the hourly update (when it's 0 minutes past the hour)
    if ((this._age % HOUR) === 0) {
      for (const ticker of this._config.fields) {
        // @ts-ignore
        this._updateOneDayHistory(ticker)
      }
    }

    // Do the weekly and monthly 1W and 1M chart
    if ((this._age % WEEK) === 0 || (this._age % MONTH)) {
      for (const ticker of this._config.fields) {
        // @ts-ignore
        this._updateOneWeekHistory(ticker)
        // @ts-ignore
        this._updateOneMonthHistory(ticker)
      }
    }
  }

  /**
   * @param {Ticker} ticker
   */
  async _updateLivePrice (ticker) {
    try {
      const latest = await this._fetchLatest(ticker)
      const price = latest[6]
      const timestampedPrice = [Date.now(), price]

      await this.put(`${ticker.base}${ticker.quote}-last`, Feed.encode(price))
      await this.put(`${ticker.base}${ticker.quote}-timestamped_price`, Feed.encode(timestampedPrice))
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * @param {Ticker} ticker
   */
  async _updateOneDayHistory (ticker) {
    try {
      // update the feed. Should have 24 values - one per hour
      // https://api-pub.bitfinex.com/v2/candles/trade:1h:tBTCUSD/hist?limit=24
      const hourly = await this._fetchHourly(ticker)
      const close = hourly
        .sort((a, b) => a[0] - b[0])
        .slice(hourly.length - 24)
      await this.put(`${ticker.base}${ticker.quote}-1D`, Feed.encode(close))
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * @param {Ticker} ticker
   */
  async _updateOneWeekHistory (ticker) {
    try {
      // https://api-pub.bitfinex.com/v2/candles/trade:12h:tBTCUSD/hist?limit=64
      const recent = await this._fetch12Hours(ticker)
      const week = recent
        .sort((a, b) => a[0] - b[0])
        .slice(recent.length - 14)

      // update the feed. 1W can have 14 values (one every 12h), 1M can have 30 values (one per day)
      await this.put(`${ticker.base}${ticker.quote}-1W`, Feed.encode(week))
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * @param {Ticker} ticker
   */
  async _updateOneMonthHistory (ticker) {
    try {
      // 30 day (keep only the daily candles)
      const dailyCandles = await this._fetchDaily(ticker)
      const month = dailyCandles
        .sort((a, b) => a[0] - b[0])
        .slice(dailyCandles.length - 30)

      await this.put(`${ticker.base}${ticker.quote}-1M`, Feed.encode(month))
    } catch (err) {
      console.error(err)
    }
  }

  /**
   * @param {Ticker} ticker
   *
   * @returns {Promise<number[]>}
   */
  async _fetchLatest (ticker) {
    // https://api-pub.bitfinex.com/v2/ticker/tBTCUSD (7th value is last price)
    const response = await fetch(`https://api-pub.bitfinex.com/v2/ticker/${ticker.ticker}`)
    if (!response.ok) throw new Error(response.statusText)
    return response.json()
  }

  /**
   * @param {Ticker} ticker
   *
   * @returns {Promise<number[][]>}
   */
  async _fetchHourly (ticker) {
    const response = await fetch(`https://api-pub.bitfinex.com/v2/candles/trade:1h:${ticker.ticker}/hist?limit=25`)
    if (!response.ok) throw new Error(response.statusText)
    return response.json()
  }

  /**
   * @param {Ticker} ticker
   *
   * @returns {Promise<number[][]>}
   */
  async _fetch12Hours (ticker) {
    const response = await fetch(`https://api-pub.bitfinex.com/v2/candles/trade:12h:${ticker.ticker}/hist?limit=64`)
    if (!response.ok) throw new Error(response.statusText)
    return response.json()
  }

  /**
   * @param {Ticker} ticker
   *
   * @returns {Promise<number[][]>}
   */
  async _fetchDaily (ticker) {
    const response = await fetch(`https://api-pub.bitfinex.com/v2/candles/trade:1D:${ticker.ticker}/hist?limit=31`)
    if (!response.ok) throw new Error(response.statusText)
    return response.json()
  }

  async close () {
    clearInterval(this._interval)
    return super.close()
  }
}

module.exports = BitcoinPriceFeed

/**
 * @typedef {{base: string, quote: string, ticker: string}} Ticker
 */
