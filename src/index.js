import BitfinexPriceFeeds from './bitfinex-price-feed.js'
import fs from 'fs'
import Oracle from './oracle.js'



// config
const config = JSON.parse(fs.readFileSync('./src/schemas/config.json', 'utf-8'))
const schema = JSON.parse(fs.readFileSync('./src/schemas/slashfeed.json', 'utf-8'))

// create a new oracle if private key is given
const PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY
const oracle = PRIVATE_KEY ? new Oracle(PRIVATE_KEY) : undefined

// create the new feed
const feeds = new BitfinexPriceFeeds(config, schema, oracle)

// get it started
feeds.init()
feeds.start()
