import { openDB } from 'idb';

const DB_NAME = 'PasswordHygieneTracker';
const DB_VERSION = 3;

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion) {
            if (!db.objectStoreNames.contains('vault')) {
                db.createObjectStore('vault', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('meta')) {
                db.createObjectStore('meta');
            }
            if (!db.objectStoreNames.contains('gamification')) {
                db.createObjectStore('gamification');
            }
            if (!db.objectStoreNames.contains('audit')) {
                db.createObjectStore('audit', { keyPath: 'id', autoIncrement: true });
            }
            if (oldVersion < 3 && !db.objectStoreNames.contains('timeline')) {
                db.createObjectStore('timeline', { keyPath: 'id', autoIncrement: true });
            }
        },
    });
};

export const getStore = async (storeName) => {
    const db = await initDB();
    return db.getAll(storeName);
};

export const saveItem = async (storeName, item, key) => {
    const db = await initDB();
    if (key) {
        return db.put(storeName, item, key);
    }
    return db.put(storeName, item);
};

export const deleteItem = async (storeName, id) => {
    const db = await initDB();
    return db.delete(storeName, id);
};

export const getItem = async (storeName, id) => {
    const db = await initDB();
    return db.get(storeName, id);
};

export const clearStore = async (storeName) => {
    const db = await initDB();
    return db.clear(storeName);
};
