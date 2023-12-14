class WatchListEntry {

    static QUERY_FIND_ALL_BY_WATCH_LIST_ID = 'SELECT * FROM WatchListEntry wle WHERE wle.watchListId = ?';
    static QUERY_FIND_BY_WATCH_LIST_ID_AND_SYMBOL = 'SELECT * FROM WatchListEntry wle WHERE wle.watchListId = ? and wle.symbol = ?';

    symbol = '';
    watchListId = '';

    constructor(symbol, watchListId) {
        this.symbol = symbol;
        this.watchListId = watchListId;
    }
}

module.exports = WatchListEntry;