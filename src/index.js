import BitfinexPriceFeeds from './bitfinex-price-feed.js'
import fs from 'fs'
import Signatory from './signatory.js'

// config
const config = JSON.parse(fs.readFileSync('./src/schemas/config.json', 'utf-8'))
const schema = JSON.parse(fs.readFileSync('./src/schemas/slashfeed.json', 'utf-8'))

let signatory
const PRIVATE_KEY = process.env.SIGNATORY_PRIVATE_KEY
if (PRIVATE_KEY) {
  // create a new signatory if private key is given
  signatory = new Signatory(PRIVATE_KEY)

  schema.type = 'exchange.price_history_timestamped_signed'
  config.storagePath = './data-signed'
}

// create the new feed
const feeds = new BitfinexPriceFeeds(config, schema, signatory)

// get it started
feeds.init()
feeds.start()
