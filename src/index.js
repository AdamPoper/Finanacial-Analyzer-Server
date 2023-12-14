const express = require('express');

const { findEntitiesByNamedQuery, findEntityByNamedQuery, persistNewEntity, deleteEntity, findEntity } = require('./persistance.js')
const WatchList = require('./entities/WatchList.js');
const WatchListEntry = require('./entities/WatchListEntry.js');

const app = express();
const PORT = 5555;

app.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));

// get all the watch lists
app.get('/watchList/all', async (req, res) => {
    const results = await findEntitiesByNamedQuery(WatchList.QUERY_FIND_ALL);
    res.send({ watchLists: results });
});

// create new watch list
app.post('/watchList/new/:name', (req, res) => {
    const name = req.params.name;
    const watchList = new WatchList(name);

    const existingWatchList = findEntityByNamedQuery(WatchList.QUERY_FIND_BY_NAME, name);
    if (existingWatchList !== null) {
        throw new Error('Watch lists cannot have duplicate names: ' + name);
    }

    persistNewEntity(WatchList.name, watchList)
        .then(() => res.send('Created new Watch list ' + name))
        .catch(() => res.send('Failure creating new watch list: ' + name));
});

app.get('/watchList/entry/all/:watchListId', async (req, res) => {
    const watchListId = req.params.watchListId;
    const watchList = findEntity(WatchList.name, watchListId);
    if (watchList === null) {
        throw new Error('Unable to locate watch list with id ' + id);
    }

    const results = await findEntitiesByNamedQuery(WatchListEntry.QUERY_FIND_ALL_BY_WATCH_LIST_ID, watchListId);
    res.send({ watchListSymbols: results });
});

// add a new entry to a watch list
app.post('/watchList/entry/new/:watchListID/:symbol', async (req, res) => {
    const watchListId = req.params.watchListID;
    const symbol = req.params.symbol.toLowerCase();

    const watchList = await findEntity(WatchList.name, watchListId);
    if (watchList === null) {
        throw new Error("Unable to find watch list with id " + watchListId);
    }

    const existingEntry = await findEntityByNamedQuery(WatchListEntry.QUERY_FIND_BY_WATCH_LIST_ID_AND_SYMBOL, [watchListId, symbol]);
    if (existingEntry !== null) {
        throw new Error('Watch list cannot have duplicate symbols');
    }

    const entry = new WatchListEntry(symbol, watchListId);
    persistNewEntity(WatchListEntry.name, entry)
        .then(() => res.send('Created new watch list entry ' + symbol + ' for ' + watchList.name))
        .catch(() => res.send('Failure adding ' + symbol + ' to ' + watchList.name));
});

// remove an entry from a watch list
app.delete('/watchList/entry/delete/:entryID', async (req, res) => {
    const watchListEntryId = req.params.entryID;
    const watchListEntry = await findEntity(WatchListEntry.name, watchListEntryId);
    if (watchListEntry === null) {
        throw new Error('Unable to find watch list entry with id ' + watchListEntryId);
    }

    deleteEntity(WatchListEntry.name, watchListEntryId)
        .then(() => res.send('Successfully deleted watch list entry ' + watchListEntryId))
        .catch(() => res.send('Failure to delete watch list entry ' + watchListEntryId));
});

// delete a watch list entirely
app.delete('/watchList/delete/:watchListId', async (req, res) => {
    const watchListId = req.params.watchListId;
    const watchList = await findEntity(WatchList.name, watchListId);
    if (watchList === null) {
        throw new Error('Unable to find watch list with id ' + watchListId);
    }

    const listEntries = await findEntitiesByNamedQuery(WatchListEntry.QUERY_FIND_ALL_BY_WATCH_LIST_ID, watchListId);
    if (listEntries.length > 0) {
        for (const listEntry of listEntries) {
            await deleteEntity(WatchListEntry.name, listEntry.id);
        }
    }

    deleteEntity(WatchList.name, watchListId)
        .then(() => res.send('Successfully deleted watch list ' + watchList.name))
        .catch(() => res.send('Failure deleting watch list ' + watchList.name));
});