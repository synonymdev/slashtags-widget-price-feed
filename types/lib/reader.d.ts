export = BitcoinPriceFeedReader;
declare class BitcoinPriceFeedReader extends Reader {
    /**
     * Read the latest price of trading pair.
     *
     * @param {Pair} pair
     * @returns {Promise<number | null>}
     */
    getLatestPrice(pair: Pair): Promise<number | null>;
    /**
     * Read the latest price of trading pair in the format.
     *
     * @param {Pair} pair
     * @returns {Promise<TimestampedPrice | null>}
     */
    getLatestPriceTimestamped(pair: Pair): Promise<TimestampedPrice | null>;
    /**
     * Read the daily candles of a trading pair.
     *
     * @param {Pair} pair
     * @returns {Promise<Candle[] | null>}
     */
    getPastDayCandles(pair: Pair): Promise<Candle[] | null>;
    /**
     * Read the weekly candles of a trading pair.
     *
     * @param {Pair} pair
     * @returns {Promise<Candle[] | null>}
     */
    getPastWeekCandles(pair: Pair): Promise<Candle[] | null>;
    /**
     * Read the weekly candles of a trading pair.
     *
     * @param {Pair} pair
     * @returns {Promise<Candle[] | null>}
     */
    getPastMonthCandles(pair: Pair): Promise<Candle[] | null>;
}
declare namespace BitcoinPriceFeedReader {
    export { Pair, TimestampedPrice, Candle };
}
import { Reader } from "@synonymdev/feeds";
type Pair = 'BTCUSD';
type TimestampedPrice = {
    price: number;
    timestamp: number;
};
type Candle = {
    timestamp: number;
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
};
//# sourceMappingURL=reader.d.ts.map