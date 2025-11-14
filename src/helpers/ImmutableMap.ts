import { deepClone } from "./deepClone";
import { deepFreeze } from "./deepFreeze";

export class ImmutableMap<K, V> {
    private readonly map: Map<K, V> = new Map();

    constructor(initialMap: ImmutableMap<K, V> | undefined = undefined) {
        if (initialMap) {            
            this.map = new Map(initialMap.map);
        }
    }

    set(key: K, value: V): this {
        const clonedValue = deepFreeze(deepClone(value));

        this.map.set(key, clonedValue);

        return this;
    }

    get(key: K): V {
        return deepClone(this.map.get(key) as V);
    }

    delete(key: K): boolean {
        return this.map.delete(key);
    }

    clear() {
        this.map.clear();
    }

    has(key: K): boolean {
        return this.map.has(key);
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.map[Symbol.iterator]();
    }
}