import BitfinexPriceFeeds from './bitfinex-price-feed.js'
import fs from 'fs'
import Oracle from './oracle.js'

const PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY
if (!PRIVATE_KEY) {
  console.error('Missing ORACLE_PRIVATE_KEY env var');
  process.exit(1);
}


// config
const config = JSON.parse(fs.readFileSync('./src/schemas/config.json', 'utf-8'))
const schema = JSON.parse(fs.readFileSync('./src/schemas/slashfeed.json', 'utf-8'))

// create a new oracle if private key is given
const oracle = new Oracle(PRIVATE_KEY)

// create the new feed
const feeds = new BitfinexPriceFeeds(config, schema, oracle)

// get it started
feeds.init()
feeds.start()
