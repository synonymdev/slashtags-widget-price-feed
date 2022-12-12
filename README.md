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

Files ending `-last` will contain array of 3 elements, defined as such: 

1. the unix timestamp as string
2. the last price truncated to the integer part as string  
3. the hex-encoded signature of the SHA256 hash of `<timestamp>|<last_price>` encoded as 64bit little endian bytes. 

For example `['1670344382195','2322400','11ecb5b066a2fd44d8f50d4e30a1fc53a35a3e560d26a1bcc8a122d261af5ad730def5a4aacb6b106d3c000a0cf4282788c24285d9689b865661a80af31f4b8a']`.

Files ending `-24h`, `-7d` and `-30d` will contain an array of strings. Oldest value first. 
For example, `[ '1234.45', '1245.78', '1267.78', ... ]`

The public key and encryption key of the drive are published to the logs when the app is started.

## Read from a Browser

To use this project as a developer, you will need to have [Node.js](https://nodejs.org) and [Yarn](https://yarnpkg.com) installed on your machine.

First run the SlashFeed

```sh
export ORACLE_PRIVATE_KEY=7b2e74fbbeba4cc82ce3cb0468c97ac3ca0da7bc426169e1ae93109ef37fc7c2
node src/index.js
```

Move to the `./examples/browser` folder

````
cd ./examples/browser
````

To install the project dependencies, run the following command:

```sh
yarn install
```

To start the relay, run the following command:

```sh
yarn relay
```

To serve the app, run the following command:

```sh
yarn serve
```