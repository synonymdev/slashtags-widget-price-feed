import { strict as assert } from 'node:assert'
import BitfinexPriceFeeds from '../src/bitfinex-price-feed.js'
import fs from 'fs'
import RAM from 'random-access-memory'
import nock from 'nock'
import * as mocks from './mocks/bitfinex-api.js'

const config = JSON.parse(fs.readFileSync('./src/schemas/config.json', 'utf-8'))
const schema = JSON.parse(fs.readFileSync('./src/schemas/slashfeed.json', 'utf-8'))
config.feedStorage = new RAM()

describe('Price feed', () => {
  let feeds
  before(() => {
    feeds = new BitfinexPriceFeeds(config, schema)
    feeds.init()
  })

  after(async function () {
    this.timeout(10000)
    await feeds.feedStorage.close()
    nock.cleanAll()
  })

  describe('Live price', () => {
    before(async function () {
      this.timeout(10000)
      nock(mocks.API_HOST).get(mocks.LAST_PATH).reply(200, mocks.LAST_RESPONSE)
      await feeds._updateLivePrice(mocks.testTicker)
    })

    it('-last gets stored in hyperdrive', async () => {
      const res = await feeds.feedStorage.get(config.driveId, `${mocks.testTicker.base}${mocks.testTicker.quote}-last`)

      assert(res - (new Date().getTime()) < 0)
      assert.equal(res, feeds._formatPrice(mocks.LAST_RESPONSE[6]))
    })

    it('-timestamped_price gets stored in hyperdrive', async () => {
      const res = await feeds.feedStorage.get(config.driveId, `${mocks.testTicker.base}${mocks.testTicker.quote}-timestamped_price`)

      assert.equal(res.length, 2)
      assert.ok(typeof res[0] === 'number')
      assert(res[0] - (new Date().getTime()) < 0)
      assert.equal(res[1], feeds._formatPrice(mocks.LAST_RESPONSE[6]))
    })
  })

  describe('Day price', () => {
    before(async () => {
      nock(mocks.API_HOST).get(mocks.ONE_DAY_PATH).reply(200, mocks.ONE_DAY_RESPONSE)
      await feeds._updateOneDayHistory(mocks.testTicker)
    })

    it('gets stored in hyperdrive', async () => {
      const res = await feeds.feedStorage.get(config.driveId, `${mocks.testTicker.base}${mocks.testTicker.quote}-24h`)

      assert.equal(res.length, 24)
      const sortedResponse = mocks.ONE_DAY_RESPONSE.sort((a, b) => a[0] - b[0])
      for (let i = 0; i < res.length; i++) {
        assert.equal(res[i], feeds._formatPrice(sortedResponse[i][2]))
      }
    })
  })

  describe('Week price', () => {
    before(async () => {
      nock(mocks.API_HOST).get(mocks.ONE_WEEK_PATH_12H).reply(200, mocks.ONE_WEEK_RESPONSE_12H)
      nock(mocks.API_HOST).get(mocks.ONE_WEEK_PATH_1D).reply(200, mocks.ONE_WEEK_RESPONSE_1D)
      await feeds._updateOneWeekHistory(mocks.testTicker)
    })

    it('is stored on hyperdrive as a bi-daily entries for last 7 days', async () => {
      const res = await feeds.feedStorage.get(config.driveId, `${mocks.testTicker.base}${mocks.testTicker.quote}-7d`)

      assert.equal(res.length, 14)
      const sortedResponse = mocks.ONE_WEEK_RESPONSE_12H.slice(1, 15).sort((a, b) => a[0] - b[0])
      for (let i = 0; i < res.length; i++) {
        assert.equal(res[i], feeds._formatPrice(sortedResponse[i][2]))
      }
    })
  })

  describe('Month price update', () => {
    before(async () => {
      nock(mocks.API_HOST).get(mocks.ONE_WEEK_PATH_12H).reply(200, mocks.ONE_WEEK_RESPONSE_12H)
      nock(mocks.API_HOST).get(mocks.ONE_WEEK_PATH_1D).reply(200, mocks.ONE_WEEK_RESPONSE_1D)
      await feeds._updateOneWeekHistory(mocks.testTicker)
    })

    it('is stored on hyperdrive as a daily entries for last 30 days', async () => {
      const res = await feeds.feedStorage.get(config.driveId, `${mocks.testTicker.base}${mocks.testTicker.quote}-30d`)
      assert.equal(res.length, 30)

      const sortedResponse = mocks.ONE_WEEK_RESPONSE_1D.slice(1, 31).sort((a, b) => a[0] - b[0])
      for (let i = 0; i < res.length; i++) {
        assert.equal(res[i], feeds._formatPrice(sortedResponse[i][2]))
      }
    })
  })
})

