const mysql = require('mysql');
const util = require('util');

const INSERT_INTO_TEMPLATE = 'INSERT INTO $ SET ?';
const DELETE_FROM_TEMPLATE = 'DELETE FROM ?? WHERE id = ?';
const SELECT_ONE_TEMPLATE = 'SELECT * from ?? WHERE id = ?';

const dbPool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Winchester86',
    database: 'financial-analyzer'
});

const queryPool = util.promisify(dbPool.query).bind(dbPool);

async function findEntitiesByNamedQuery(query, args) {
    let results;
    try {
        if (args) {
            results = await queryPool(query, args);
        } else {
            results = await queryPool(query);
        }
        return results;
    } catch (error) {
        console.log(error);
    }
}

async function findEntityByNamedQuery(query, args) {
    try {
        const results = await queryPool(query, args);
        return !!results && results.length > 0 ? results[0] : null;
    } catch (error) {
        console.log(error);
    }
}

async function findEntity(clazz, id) {
    const inserts = [clazz, id];
    const query = mysql.format(SELECT_ONE_TEMPLATE, inserts);

    try {
        const results = await queryPool(query);
        return !!results && results.length > 0 ? results[0] : null;
    } catch (error) {
        console.log(error);
    }
}

async function persistNewEntity(clazz, entity) {
    const query = INSERT_INTO_TEMPLATE.replace('$', clazz);

    try {
        return await queryPool(query, entity);
    } catch (error) {
        console.log(error);
    }
}

async function deleteEntity(clazz, entityId) {
    const inserts = [clazz, entityId];
    const query = mysql.format(DELETE_FROM_TEMPLATE, inserts);
    
    try {
        return await queryPool(query);
    } catch (error) {
        console.log(error);
    }
}

module.exports = { 
    findEntitiesByNamedQuery, 
    findEntityByNamedQuery, 
    persistNewEntity,
    deleteEntity,
    findEntity
};