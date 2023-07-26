# slashtags-widget-price-feed

Provides price information as a slashtags feed.

Data is provided in a hyperdrive that you can replicate to get the latest information.

The drive contains the following files (example feed files are for the BTCUSD pair, but the list of available pairs are listed in the slashfeed.json file)...

```
slashfeed.json - metadata about the feeds using the type `price_feed`
feeds/
    BTCUSD-last - the last update price of the BTCUSD pair. Updated often.
    BTCUSD-1D - an array of the last 24 hourly candle closing prices (covers the last days trading)
    BTCUSD-1W - an array of the last 14 12h candle closes (covers 1 weeks trading)
    BTCUSD-1M - an array of the last 30 daily candle closes (covers 1 month)
```

Files ending `-last` will contain a single string of the last price. For example '1234.56'.

Files ending `-timestamped_price` will contain array of 2 elements, defined as such:

1. the unix timestamp as an integer
2. the last price truncated to the integer part as string

For example `[1670344382195,'2322400']`.

Files ending `-1D`, `-1W` and `-1M` will contain an array of strings. Oldest value first.
For example, `[ '1234.45', '1245.78', '1267.78', ... ]`

The public key and encryption key of the drive are published to the logs when the app is started.
