export function deepClone<T>(input: T, cache = new WeakMap<object, any>()): T {
    // Primitives & functions
    if (input === null || typeof input !== "object") return input;

    // Cached (handle circular)
    if (cache.has(input as any)) return cache.get(input as any);

    // Built-ins
    if (input instanceof Date) return new Date(input.getTime()) as any;

    // Map & Set
    if (input instanceof Map) {
        const out = new Map();
        cache.set(input, out);
        for (const [k, v] of input) out.set(deepClone(k as any, cache), deepClone(v as any, cache));
        return out as any;
    }
    if (input instanceof Set) {
        const out = new Set();
        cache.set(input, out);
        for (const v of input) out.add(deepClone(v as any, cache));
        return out as any;
    }

    // ✅ Array special-case: build a fresh, mutable array
    if (Array.isArray(input)) {
      const src = input as unknown as any[];
      const arr: any[] = new Array(src.length);
      cache.set(input as any, arr);

      // copy numeric indices
      for (let i = 0; i < src.length; i++) {
        arr[i] = deepClone(src[i] as any, cache);
      }

      // copy non-index own properties (excluding "length")
      for (const key of Reflect.ownKeys(src)) {
        if (key === "length") continue;
        if (typeof key === "string" && /^[0-9]+$/.test(key)) continue;
        const desc = Object.getOwnPropertyDescriptor(src, key as any)!;
        defineCloned(arr, src, key, desc, cache);
      }
      return arr as any as T;
    }

    // default: preserve prototype & descriptors
    const proto = Object.getPrototypeOf(input);
    const output: any = Array.isArray(input) ? [] : Object.create(proto);

    cache.set(input as any, output);

    for (const key of Reflect.ownKeys(input)) {
        const desc = Object.getOwnPropertyDescriptor(input, key as any)!;
        defineCloned(output, input, key, desc, cache);
    }

    return output as T;
}

function defineCloned(
  target: object,
  source: any,
  key: PropertyKey,
  desc: PropertyDescriptor,
  cache: WeakMap<object, any>
) {
  if ("get" in desc || "set" in desc) {
    // keep accessor functions; don't pass undefined fields with exactOptionalPropertyTypes
    const pd: PropertyDescriptor = {};
    if (desc.get) pd.get = desc.get;
    if (desc.set) pd.set = desc.set;
    if (desc.enumerable !== undefined) pd.enumerable = desc.enumerable;
    // make accessor configurable on the clone to stay flexible
    pd.configurable = true;
    Object.defineProperty(target, key, pd);
    return;
  }

  const value = desc.value;
  const clonedValue =
    value && typeof value === "object" ? deepClone(value, cache) : value;

  // force mutability on data props of clones
  Object.defineProperty(target, key, {
    value: clonedValue,
    writable: true,
    configurable: true,
    enumerable: desc.enumerable ?? true,
  });
}

// function defineCloned(
//   target: object,
//   source: any,
//   key: PropertyKey,
//   desc: PropertyDescriptor,
//   cache: WeakMap<object, any>
// ) {
//   if ("get" in desc || "set" in desc) {
//     // Accessor property
//     const pd: PropertyDescriptor = {
//       get: desc.get!,
//       set: desc.set!,
//     };
//     if (desc.enumerable !== undefined) pd.enumerable = desc.enumerable;
//     if (desc.configurable !== undefined) pd.configurable = desc.configurable;

//     Object.defineProperty(target, key, pd);
//   } else {
//     // Data property
//     const value = desc.value;
//     const clonedValue =
//       value && typeof value === "object" ? deepClone(value, cache) : value;

//     const pd: PropertyDescriptor = { value: clonedValue };
//     if (desc.writable !== undefined) pd.writable = desc.writable;
//     if (desc.enumerable !== undefined) pd.enumerable = desc.enumerable;
//     if (desc.configurable !== undefined) pd.configurable = desc.configurable;

//     Object.defineProperty(target, key, pd);
//   }
// }
