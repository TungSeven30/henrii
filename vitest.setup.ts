const memoryStorage = new Map<string, string>();

const storageShim: Storage = {
  getItem(key: string) {
    return memoryStorage.get(key) ?? null;
  },
  setItem(key: string, value: string) {
    memoryStorage.set(key, value);
  },
  removeItem(key: string) {
    memoryStorage.delete(key);
  },
  clear() {
    memoryStorage.clear();
  },
  key(index: number) {
    return Array.from(memoryStorage.keys())[index] ?? null;
  },
  get length() {
    return memoryStorage.size;
  },
};

const localStorageMaybe = globalThis.localStorage as Partial<Storage> | undefined;
if (!localStorageMaybe || typeof localStorageMaybe.setItem !== "function") {
  Object.defineProperty(globalThis, "localStorage", {
    value: storageShim,
    configurable: true,
  });
}
