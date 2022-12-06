import fs from 'fs'
import Feeds from '@synonymdev/feeds'
import { format, encode } from '@synonymdev/slashtags-url'
import axios from 'axios'
import logger from './logger.js'

export default class BitfinexPriceFeeds {
    constructor(config, schema, oracle) {
        this.config = config
        this.schema = schema
        this.minuteTimer = null
        this.feedStorage = null
        this.driveId = config.driveId
        this.oracle = oracle
    }

    async init() {
        if (this.feedStorage) {
            throw new Error('Init called twice')
        }

        // Set up the storage for the feeds
        this.feedStorage = new Feeds(this.config.storagePath, this.schema)

        // ensure a drive has been created for our feeds and announce it - gets the keys back
        const driveKeys = await this.feedStorage.feed(this.driveId, { announce: true })

        // Write the images into the feed
        const imageData = fs.readFileSync('./src/schemas/images/bitfinex.svg')
        await this.feedStorage.ensureFile(this.driveId, '/images/bitfinex.svg', imageData)

        // this is the hyperdrive that will contain all the feed data
        const url = format(driveKeys.key, { protocol: 'slashfeed:', fragment: { encryptionKey: encode(driveKeys.encryptionKey) } })
        logger.info(this.schema.name)
        logger.info(url)

        for (let t of this.schema.fields) {
            logger.info(`Tracking price of ${t.base}/${t.quote} : ${t.name}`)
        }
    }

    async start() {
        if (!this.feedStorage) {
            throw new Error('Must call init before you can start')
        }

        // just start the timer
        this._setMinuteTimer()
    }

    async stop() {
        clearTimeout(this.minuteTimer)
    }

    ////////////////////////////////////////////////////
    ////////////////////////////////////////////////////

    _setMinuteTimer() {
        this.minuteTimer = setTimeout(() => this._onMinuteTimer(), this._msToNextMinute())
    }

    async _onMinuteTimer() {
        logger.info('Refresh Price Feed')
        const now = new Date()
        const hour = now.getHours()
        const minute = now.getMinutes()

        // Do all the live prices - these are high priority, so do them all first
        for (let ticker of this.schema.fields) {
            await this._updateLivePrice(ticker)
        }

        // Do the hourly, weekly and monthly feeds
        // time to do the hourly update (when it's 0 minutes past the hour)
        if (minute === 0) {
            logger.info('Refresh 24h chart')
            for (let ticker of this.schema.fields) {
                await this._updateOneDayHistory(ticker)
            }
        }

        if (minute === 0 && hour === 0) {
            logger.info('Refresh 7d and 30d chart')
            for (let ticker of this.schema.fields) {
                await this._updateOneWeekHistory(ticker)
            }
        }

        // Ask for another go at the start of the next minute, whenever that is
        this._setMinuteTimer()
    }

    async _updateLivePrice(ticker) {
        try {
            // update the feed
            // https://api-pub.bitfinex.com/v2/ticker/tBTCUSD (7th value is last price)
            const latest = await axios.get(`https://api-pub.bitfinex.com/v2/ticker/${ticker.ticker}`)
            const price = this._formatPrice(latest.data[6])

            const timestamp = new Date().getTime()

            // make a signature of the <timestamp>|<last price>
            const attestation = this.oracle.priceAttestation({ price, timestamp })

            logger.debug(`${ticker.base}/${ticker.quote}: ${attestation}`)
            
            // attestation is an array [timestamp, price, signature]
            await this.feedStorage.update(this.driveId, `${ticker.base}${ticker.quote}-last`, attestation)
        } catch (err) {
            logger.error(err)
        }
    }

    async _updateOneDayHistory(ticker) {
        try {
            // update the feed. Should have 24 values - one per hour
            // https://api-pub.bitfinex.com/v2/candles/trade:1h:tBTCUSD/hist?limit=24
            const hourly = await axios.get(`https://api-pub.bitfinex.com/v2/candles/trade:1h:${ticker.ticker}/hist?limit=25`)
            const close = hourly.data
                .sort((a, b) => a[0] - b[0])
                .map((c) => this._formatPrice(c[2]))
                .slice(0, 24)
            await this.feedStorage.update(this.driveId, `${ticker.base}${ticker.quote}-24h`, close)
        } catch (err) {
            logger.error(err)
        }
    }

    async _updateOneWeekHistory(ticker) {
        try {
            // https://api-pub.bitfinex.com/v2/candles/trade:12h:tBTCUSD/hist?limit=64
            const recent = await axios.get(`https://api-pub.bitfinex.com/v2/candles/trade:12h:${ticker.ticker}/hist?limit=64`)
            const week = recent.data
                .slice(1, 15)
                .sort((a, b) => a[0] - b[0])
                .map((c) => this._formatPrice(c[2]))

            // update the feed. 7d can have 14 values (one every 12h), 30d can have 30 values (one per day)
            await this.feedStorage.update(this.driveId, `${ticker.base}${ticker.quote}-7d`, week)

            // 30 day (keep only the daily candles)
            const dailyCandles = await axios.get(`https://api-pub.bitfinex.com/v2/candles/trade:1D:${ticker.ticker}/hist?limit=31`)
            const month = dailyCandles.data
                .slice(1, 31)
                .sort((a, b) => a[0] - b[0])
                .map((c) => this._formatPrice(c[2]))

            await this.feedStorage.update(this.driveId, `${ticker.base}${ticker.quote}-30d`, month)
        } catch (err) {
            logger.error(err)
        }
    }

    _msToNextUnit(unit) {
        const now = Date.now()
        const nextUnitStartsAt = Math.floor((Math.ceil(now / unit) * unit))

        return nextUnitStartsAt - now
    }

    _msToNextMinute() {
        // add 10ms, so we always land the right side of the minute
        return this._msToNextUnit(1000 * 60) + 10
    }

    _formatPrice(val) {
        let v = (+val).toPrecision(5);
        if (v.indexOf('e') >= 0) {
            v = (+v).toString();
        } else if (v.indexOf('.') >= 0) {
            v = v.replace(/(\.|)0+$/, '');
        }

        return v;
    }
}
