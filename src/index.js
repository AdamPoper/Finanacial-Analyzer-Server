const express = require('express');
const cors = require('cors');

const Persistance = require('./persistance.js')
const WatchList = require('./entities/WatchList.js');
const WatchListEntry = require('./entities/WatchListEntry.js');

const app = express();
const PORT = 5555;

app.listen(PORT, () => console.log(`Server is listening on port: ${PORT}`));

const corsOptions = {
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));

// get all the watch lists
app.get('/watchList/all', async (req, res) => {
    const results = await Persistance.findEntitiesByNamedQuery(WatchList.QUERY_FIND_ALL);
    res.status(200).json({ watchLists: results });
});

// create new watch list
app.post('/watchList/new/:name', async (req, res) => {
    const name = req.params.name;
    const watchList = new WatchList(name);

    const existingWatchList = await Persistance.findEntityByNamedQuery(WatchList.QUERY_FIND_BY_NAME, name);
    if (existingWatchList !== null) {
        const msg = 'Watch lists cannot have duplicate names: ' + name;
        res.status(400).json({ message: msg });
    }

    Persistance.persistNewEntity(WatchList.name, watchList)
        .then(() => res.status(200).json({ message: 'Created new Watch list ' + name }))
        .catch(() => res.status(500).json({ message: 'Failure creating new watch list: ' + name }));
});

app.put('/watchList/rename/:watchListId/:newName', async (req, res) => {
    const id = req.params.watchListId;
    const newName = req.params.newName;

    const watchList = await Persistance.findEntity(WatchList.name, id);
    if (watchList === null) {
        const msg = 'Unable to find watch list with id ' + id;
        console.error(msg);
        res.status(404).send(msg);
    }
    watchList.name = newName;

    Persistance.updateEntity(WatchList.name, watchList)
        .then(() => res.status(200).send('Successfully updated watch list ' + newName))
        .catch(() => res.status(500).send('Failure updating watch list'));
});

app.get('/watchList/entry/all/:watchListId', async (req, res) => {
    const watchListId = req.params.watchListId;
    const watchList = await Persistance.findEntity(WatchList.name, watchListId);
    if (watchList === null) {
        const msg = 'Unable to locate watch list with id ' + id;
        console.error(msg);
        res.status(404).send(msg);
    }

    const results = await Persistance.findEntitiesByNamedQuery(WatchListEntry.QUERY_FIND_ALL_BY_WATCH_LIST_ID, watchListId);
    res.status(200).json(results);
});

// add a new entry to a watch list
app.post('/watchList/entry/new/:watchListID/:symbol', async (req, res) => {
    const watchListId = req.params.watchListID;
    const symbol = req.params.symbol.toLowerCase();

    const watchList = await Persistance.findEntity(WatchList.name, watchListId);
    if (watchList === null) {
        const msg = 'Unable to find watch list with id ' + watchListId;
        res.status(404).json({ message: msg });
    }

    const existingEntry = await Persistance
        .findEntityByNamedQuery(WatchListEntry.QUERY_FIND_BY_WATCH_LIST_ID_AND_SYMBOL, [watchListId, symbol]);
    if (existingEntry !== null) {
        const msg = 'Watch list cannot have duplicate symbols';
        res.status(400).json({ message: msg });
    }

    const entry = new WatchListEntry(symbol, watchListId);
    Persistance.persistNewEntity(WatchListEntry.name, entry)
        .then(() => res.status(200).json({ message: 'Created new watch list entry ' + symbol + ' for ' + watchList.name }))
        .catch(() => res.status(500).json({ message: 'Failure adding ' + symbol + ' to ' + watchList.name }));
});

// remove an entry from a watch list
app.delete('/watchList/entry/delete/:entryID', async (req, res) => {
    const watchListEntryId = req.params.entryID;
    const watchListEntry = await Persistance.findEntity(WatchListEntry.name, watchListEntryId);
    if (watchListEntry === null) {
        const msg = 'Unable to find watch list entry with id ' + watchListEntryId;
        console.error(msg);
        res.status(404).json({ message: msg });
    }

    Persistance.deleteEntity(WatchListEntry.name, watchListEntryId)
        .then(() => res.status(200).json({ message: 'Successfully deleted watch list entry ' + watchListEntryId }))
        .catch(() => res.status(500).json({ message: 'Failure to delete watch list entry ' + watchListEntryId }));
});

// delete a watch list entirely
app.delete('/watchList/delete/:watchListId', async (req, res) => {
    const watchListId = req.params.watchListId;
    const watchList = await Persistance.findEntity(WatchList.name, watchListId);
    if (watchList === null) {
        const msg = 'Unable to find watch list with id ' + watchListId;
        console.error(msg);
        res.status(404).send(msg);
    }

    const listEntries = await Persistance.findEntitiesByNamedQuery(WatchListEntry.QUERY_FIND_ALL_BY_WATCH_LIST_ID, watchListId);
    if (listEntries.length > 0) {
        for (const listEntry of listEntries) {
            await Persistance.deleteEntity(WatchListEntry.name, listEntry.id);
        }
    }

    Persistance.deleteEntity(WatchList.name, watchListId)
        .then(() => res.status(200).json({ message: 'Successfully deleted watch list ' + watchList.name}))
        .catch(() => res.status(500).json({ message: 'Failure deleting watch list ' + watchList.name }));
});