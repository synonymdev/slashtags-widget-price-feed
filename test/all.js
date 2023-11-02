const test = require('brittle')
const os = require('os')
const fs = require('fs')
const path = require('path')
const { Client, Relay } = require('@synonymdev/web-relay')

const mocks = require('./mocks/bitfinex-api.js')
const { Reader, Feed } = require('../index.js')

const icon = fs.readFileSync(path.join(__dirname, '../lib/icon.svg'))
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../lib/slashfeed.json'), 'utf8'))

test('immediate update', async (t) => {
  const relay = new Relay(tmpdir())
  const address = await relay.listen()

  const client = new Client({ storage: tmpdir(), relay: address })
  const feed = new Feed(client, config, { icon })
  mock(feed)

  await feed.ready()

  const readerClient = new Client({ storage: tmpdir() })
  const reader = new Reader(readerClient, feed.url)

  t.alike(await reader.getConfig(), config)
  t.alike(await reader.getIcon(), icon)

  const lastPrice = await reader.getLatestPrice('BTCUSD')
  const timestamped = await reader.getLatestPriceTimestamped('BTCUSD')

  t.is(lastPrice, mocks.LAST_RESPONSE[6], 'last price')
  t.ok(timestamped.timestamp < Date.now())
  t.is(timestamped.price, mocks.LAST_RESPONSE[6], 'timestamped price')

  t.snapshot(await reader.getPastDayCandles('BTCUSD'), 'day candles')
  t.snapshot(await reader.getPastWeekCandles('BTCUSD'), 'week candles')
  t.snapshot(await reader.getPastMonthCandles('BTCUSD'), 'month candles')

  relay.close()
  await feed.close()
})

test('subscribe', async (t) => {
  const relay = new Relay(tmpdir())
  const address = await relay.listen()

  const client = new Client({ storage: tmpdir(), relay: address })
  const feed = new Feed(client, config, { icon })
  mock(feed)

  await feed.ready()

  const readerClient = new Client({ storage: tmpdir() })
  const reader = new Reader(readerClient, feed.url)

  const ts = t.test('subscribe')
  ts.plan(4)

  const tested = {
    lastprice: false,
    dayprice: false,
    weekprice: false,
    monthprice: false
  }

  reader.subscribeLatestPrice('BTCUSD', price => {
    if (testedAlready('lastprice')) return
    ts.is(price, mocks.LAST_RESPONSE[6], 'last price')
  })

  reader.subscribePastDayCandles('BTCUSD', candles => {
    if (testedAlready('dayprice')) return
    ts.snapshot(candles, 'day price')
  })

  reader.subscribePastWeekCandles('BTCUSD', candles => {
    if (testedAlready('weekprice')) return
    ts.snapshot(candles, 'week price')
  })

  reader.subscribePastMonthCandles('BTCUSD', candles => {
    if (testedAlready('monthprice')) return
    ts.snapshot(candles, 'month price')
  })

  /** @param {string} name */
  function testedAlready (name) {
    if (tested[name]) return true
    tested[name] = true
  }

  await ts

  readerClient.close()
  feed.close()
  relay.close()
})

/**
 * @param {import('../index.js').Feed} feed
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
