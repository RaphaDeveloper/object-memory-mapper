// Utility to deep-freeze snapshots (so the fake's persisted state can't be mutated)
export function deepFreeze<T>(obj: T, seen = new WeakSet<object>()): T {
    if (obj === null || typeof obj !== "object" || seen.has(obj as any)) return obj;
    
    seen.add(obj as any);
    
    for (const key of Reflect.ownKeys(obj as any)) {
      deepFreeze((obj as any)[key], seen);
    }
    
    return Object.freeze(obj);
}