/**
 * IndexedDB Offline Storage Manager for ClearGuide PWA
 * Database: ClearGuideOfflineDB
 * Stores: manuals, chunks
 */

const DB_NAME = 'ClearGuideOfflineDB';
const DB_VERSION = 1;

export interface OfflineManual {
  id: string;
  title: string;
  storageUrl: string;
  status: string;
  cachedAt: string;
  metadata?: any;
}

export interface OfflineChunk {
  id: string;
  manualId: string;
  content: string;
  title?: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('manuals')) {
        db.createObjectStore('manuals', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('chunks')) {
        const chunkStore = db.createObjectStore('chunks', { keyPath: 'id' });
        chunkStore.createIndex('manualId', 'manualId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveManualOffline(manual: OfflineManual, chunks: OfflineChunk[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['manuals', 'chunks'], 'readwrite');
    const manualStore = tx.objectStore('manuals');
    const chunkStore = tx.objectStore('chunks');

    manualStore.put({ ...manual, cachedAt: new Date().toISOString() });

    chunks.forEach((chunk) => {
      chunkStore.put(chunk);
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineManual(manualId: string): Promise<{ manual: OfflineManual | null; chunks: OfflineChunk[] }> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['manuals', 'chunks'], 'readonly');
    const manualStore = tx.objectStore('manuals');
    const chunkStore = tx.objectStore('chunks');
    const index = chunkStore.index('manualId');

    const getManualReq = manualStore.get(manualId);
    const getChunksReq = index.getAll(manualId);

    tx.oncomplete = () => {
      resolve({
        manual: getManualReq.result || null,
        chunks: getChunksReq.result || [],
      });
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function isManualOfflineSaved(manualId: string): Promise<boolean> {
  try {
    const data = await getOfflineManual(manualId);
    return !!data.manual;
  } catch {
    return false;
  }
}

export async function listOfflineManuals(): Promise<OfflineManual[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('manuals', 'readonly');
    const store = tx.objectStore('manuals');
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function removeOfflineManual(manualId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['manuals', 'chunks'], 'readwrite');
    const manualStore = tx.objectStore('manuals');
    const chunkStore = tx.objectStore('chunks');
    const index = chunkStore.index('manualId');

    manualStore.delete(manualId);

    const getKeysReq = index.getAllKeys(manualId);
    getKeysReq.onsuccess = () => {
      const keys = getKeysReq.result;
      keys.forEach((key) => chunkStore.delete(key));
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function searchOfflineChunks(query: string): Promise<OfflineChunk[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('chunks', 'readonly');
    const store = tx.objectStore('chunks');
    const req = store.getAll();

    req.onsuccess = () => {
      const allChunks: OfflineChunk[] = req.result || [];
      const lowerQuery = query.toLowerCase();
      const matches = allChunks.filter(
        (chunk) =>
          chunk.content.toLowerCase().includes(lowerQuery) ||
          (chunk.title && chunk.title.toLowerCase().includes(lowerQuery))
      );
      resolve(matches);
    };
    req.onerror = () => reject(req.error);
  });
}
