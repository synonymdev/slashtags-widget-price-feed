import BitfinexPriceFeeds from './bitfinex-price-feed.js'
import fs from 'fs'

// config
const config = JSON.parse(fs.readFileSync('./src/schemas/config.json', 'utf-8'))
const schema = JSON.parse(fs.readFileSync('./src/schemas/slashfeed.json', 'utf-8'))

// create the new feed
const feeds = new BitfinexPriceFeeds(config, schema)

// get it started
feeds.init()
feeds.start()
