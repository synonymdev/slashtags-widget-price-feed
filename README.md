# slashtags-widget-price-feed

Provides price information as a slashtags feed.

## Usage

### Feed

Copy `config/config.example.json` to `config/config.json` then edit the relay address.

```bash
cp config/config.example.json config/config.json
```

Start the feed writer

```bash
npm start
```

It will generate a `keyPair` and persist that in `config/config.json` for future sessions.

It should print: `Running Bitcoin price feed: slashfeed:<id>/Bitcoin Price?relay=<relay-address>`

### Reader

To read The price feed use the `Reader` helper class.

```js
const { Feed, Reader } = require('slashtags-widget-price-feed')

(async () => {
  const client = new Client({ storage: './path/to/feed/storage', relay: 'https://web-relay.example.com' })
  const feed = new Feed(client, config, { icon })

  await feed.ready() 

  const client = new Client({ storage: './path/to/reader/storage'})

  const readerClient = new Client({ storage: tmpdir() })
  const reader = new Reader(readerClient, feed.url)

  reader.subscribeLatestPrice('BTCUSD', price => {
    // BTC/USD price (latest)
  })

  reader.subscribePastDayCandles('BTCUSD', candles => {
    // BTC/USD price candles for the past day
  })

  reader.subscribePastWeekCandles('BTCUSD', candles => {
    // BTC/USD price candles for the past week
  })

  reader.subscribePastMonthCandles('BTCUSD', candles => {
    // BTC/USD price candles for the past month
  })
})
```
