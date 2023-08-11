const test = require('brittle')
const os = require('os')
const fs = require('fs')
const path = require('path')
const { Client, Relay } = require('@synonymdev/web-relay')

const BitcoinPriceFeed = require('../lib/writer.js')
const mocks = require('./mocks/bitfinex-api.js')
const Reader = require('../lib/reader.js')

const icon = fs.readFileSync(path.join(__dirname, '../lib/icon.svg'))
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/slashfeed.json'), 'utf8'))

test('immediate update', async (t) => {
  const relay = new Relay(tmpdir())
  const address = await relay.listen()

  const client = new Client({ storage: tmpdir(), relay: address })
  const feed = new BitcoinPriceFeed(client, config, { icon })
  mock(feed)

  await feed.ready()

  const readerClient = new Client({ storage: tmpdir() })
  const reader = new Reader(readerClient, feed.url)

  t.alike(await reader.getConfig(), config)

  const lastPrice = await reader.getLatestPrice('BTCUSD')
  const timestamped = await reader.getLatestPriceTimestamped('BTCUSD')

  t.is(lastPrice, mocks.LAST_RESPONSE[6], 'last price')
  t.ok(timestamped.timestamp < Date.now())
  t.is(timestamped.price, mocks.LAST_RESPONSE[6], 'timestamped price')

  const day = await reader.getPastDayCandles('BTCUSD')

  t.alike(
    day,
    mocks.ONE_DAY_RESPONSE.sort((a, b) => a[0] - b[0]).slice(0, 24).map(c => ({
      timestamp: c[0],
      open: c[1],
      close: c[2],
      high: c[3],
      low: c[4],
      volume: c[5]
    })),
    'day candles'
  )

  const week = await reader.getPastWeekCandles('BTCUSD')
  t.alike(
    week,
    mocks.ONE_WEEK_RESPONSE_12H.sort((a, b) => a[0] - b[0]).slice(1, 15).map(c => ({
      timestamp: c[0],
      open: c[1],
      close: c[2],
      high: c[3],
      low: c[4],
      volume: c[5]
    })),
    'week candles'
  )

  const month = await reader.getPastMonthCandles('BTCUSD')
  t.alike(
    month,
    mocks.ONE_MONTH_RESPONSE_1D.sort((a, b) => a[0] - b[0]).slice(1, 31).map(c => ({
      timestamp: c[0],
      open: c[1],
      close: c[2],
      high: c[3],
      low: c[4],
      volume: c[5]
    })),
    'month candles'
  )

  relay.close()
  await feed.close()
})

/**
 * @param {BitcoinPriceFeed} feed
 */
function mock (feed) {
  feed._fetchLatest = async () => mocks.LAST_RESPONSE
  feed._fetchHourly = async () => mocks.ONE_DAY_RESPONSE
  feed._fetch12Hours = async () => mocks.ONE_WEEK_RESPONSE_12H
  feed._fetchDaily = async () => mocks.ONE_MONTH_RESPONSE_1D
}

function tmpdir () {
  return path.join(os.tmpdir(), Math.random().toString(16).slice(2))
}
