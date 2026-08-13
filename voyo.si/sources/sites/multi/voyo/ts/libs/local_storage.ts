import AppOptions from "@core/app/options";

class StoredData<T> {
    expiresAt: number;
    payload: T
}

class LocalStorage {
    constructor(
        protected options: AppOptions
    ) { }

    get<T>(key: string, defValue: T|null = null): T | null {
        const data = localStorage.getItem(key);

        if (!data) {
            return defValue;
        }

        let storedData: StoredData<T>;

        try {
            storedData = JSON.parse(data);
        } catch {
            console.log('Bad data in local storage', key, data);
            return defValue;
        }

        if (storedData.expiresAt < 0 || storedData.expiresAt > Date.now()) {
            return storedData.payload;
        }

        localStorage.removeItem(key);
        return defValue;
    }

    /**
     * Set expireMinutes to -1 if you don't want cache to expire.
     */
    set<T>(key: string, payload: T, expireMinutes: number = -1): void {
        const expiresAt = expireMinutes > 0 ? Date.now() + expireMinutes * 60 * 1000 : -1;
        const storedData: StoredData<T> = { payload, expiresAt };
        localStorage.setItem(key, JSON.stringify(storedData));
    }

    remove(key: string): void {
        localStorage.removeItem(key);
    }
}

export default LocalStorage;