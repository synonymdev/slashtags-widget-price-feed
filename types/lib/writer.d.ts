export = BitcoinPriceFeed;
declare class BitcoinPriceFeed extends Feed {
    /**
     * @param {ConstructorParameters<typeof Feed>[0]} client
     * @param {ConstructorParameters<typeof Feed>[1]} config
     * @param {ConstructorParameters<typeof Feed>[2]} opts
     */
    constructor(client: [client: import("@synonymdev/web-relay/types/lib/client/index"), config: Feed.Config, opts?: {
        icon?: Uint8Array;
    }][0], config: [client: import("@synonymdev/web-relay/types/lib/client/index"), config: Feed.Config, opts?: {
        icon?: Uint8Array;
    }][1], opts: [client: import("@synonymdev/web-relay/types/lib/client/index"), config: Feed.Config, opts?: {
        icon?: Uint8Array;
    }][2]);
    _config: Feed.Config;
    _age: number;
    _interval: NodeJS.Timer;
    start(): Promise<void>;
    onInterval(): Promise<void>;
    /**
     * @param {Ticker} ticker
     */
    _updateLivePrice(ticker: Ticker): Promise<void>;
    /**
     * @param {Ticker} ticker
     */
    _updateOneDayHistory(ticker: Ticker): Promise<void>;
    /**
     * @param {Ticker} ticker
     */
    _updateOneWeekHistory(ticker: Ticker): Promise<void>;
    /**
     * @param {Ticker} ticker
     */
    _updateOneMonthHistory(ticker: Ticker): Promise<void>;
    /**
     * @param {Ticker} ticker
     *
     * @returns {Promise<number[]>}
     */
    _fetchLatest(ticker: Ticker): Promise<number[]>;
    /**
     * @param {Ticker} ticker
     *
     * @returns {Promise<number[][]>}
     */
    _fetchHourly(ticker: Ticker): Promise<number[][]>;
    /**
     * @param {Ticker} ticker
     *
     * @returns {Promise<number[][]>}
     */
    _fetch12Hours(ticker: Ticker): Promise<number[][]>;
    /**
     * @param {Ticker} ticker
     *
     * @returns {Promise<number[][]>}
     */
    _fetchDaily(ticker: Ticker): Promise<number[][]>;
}
declare namespace BitcoinPriceFeed {
    export { Ticker };
}
import { Feed } from "@synonymdev/feeds";
type Ticker = {
    base: string;
    quote: string;
    ticker: string;
};
//# sourceMappingURL=writer.d.ts.map