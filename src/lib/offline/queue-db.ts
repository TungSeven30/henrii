import type { OfflineQueuePayload } from "@/lib/events/types";

const DB_NAME = "henrii-offline-queue";
const DB_VERSION = 2;
const STORE_NAME = "events";

export type QueuedEvent = {
  id: string;
  createdAt: string;
  payload: OfflineQueuePayload;
};

function isIndexedDbAvailable() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDbAvailable()) {
      reject(new Error("IndexedDB is unavailable"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open IndexedDB"));
  });
}

async function withStore<T>(
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await openDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = handler(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed"));
  });
}

export async function enqueueEvent(payload: OfflineQueuePayload): Promise<void> {
  const item: QueuedEvent = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    payload,
  };

  await withStore("readwrite", (store) => store.put(item));
}

export async function listQueuedEvents(): Promise<QueuedEvent[]> {
  const result = await withStore<QueuedEvent[]>("readonly", (store) => store.getAll());
  return result.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function removeQueuedEvent(id: string): Promise<void> {
  await withStore("readwrite", (store) => store.delete(id));
}

export async function countQueuedEvents(): Promise<number> {
  return withStore<number>("readonly", (store) => store.count());
}
