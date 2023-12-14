class WatchList {
    
    static QUERY_FIND_ALL = 'SELECT * FROM WatchList';
    static QUERY_FIND_BY_NAME = 'SELECT * FROM WatchList WHERE name = ?';

    name = '';

    constructor(name) {
        this.name = name;
    }
}

module.exports = WatchList;