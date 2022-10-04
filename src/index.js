const BitfinexPriceFeeds = require('./bitfinex-price-feed')

// config
const config = require('./schemas/config.json')
const schema = require('./schemas/slashfeed.json')

// create the new feed
const feeds = new BitfinexPriceFeeds(config, schema)

// get it started
feeds.init()
feeds.start()
