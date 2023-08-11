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
const 

```
