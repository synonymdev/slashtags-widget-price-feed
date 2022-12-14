# slashtags-widget-price-feed

Provides price information as a slashtags feed.

Data is provided in a hyperdrive that you can replicate to get the latest information.

The drive contains the following files (example feed files are for the BTCUSD pair, but the list of available pairs are listed in the slashfeed.json file)...

```
slashfeed.json - metadata about the feeds using the type `price_feed`
feeds/
    BTCUSD-last - the last update price of the BTCUSD pair. Updated often.
    BTCUSD-24h - an array of the last 24 hourly candle closing prices (covers the last days trading)
    BTCUSD-7d - an array of the last 14 12h candle closes (covers 1 weeks trading)
    BTCUSD-30d - an array of the last 30 daily candle closes (covers 1 month)
```

Files ending `-last` will contain a single string of the last price. For example '1234.56'.

Files ending `-24h`, `-7d` and `-30d` will contain an array of strings. Oldest value first. 
For example, `[ '1234.45', '1245.78', '1267.78', ... ]`

The public key and encryption key of the drive are published to the logs when the app is started.