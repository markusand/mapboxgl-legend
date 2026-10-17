import type { MapboxMap } from '/@/types';

export const ensureArray = <T>(thing: T | T[]): T[] => (Array.isArray(thing) ? thing : [thing]);

// Pick non-null values from obj for the given keys
export const pick = <T extends Record<string, unknown>>(obj: T, keys: readonly (keyof T)[]) =>
  Object.fromEntries(keys.filter(k => obj[k] != null).map(k => [k, obj[k]]));

// Linear interpolation: maps val from [x1,y1] range into [x2,y2] range
export const rescale = (val: number, x1: number, y1: number, x2 = 0, y2 = 100) =>
  ((val - x1) * (y2 - x2)) / (y1 - x1) + x2;

// Splits array into consecutive sub-arrays of length size
export const chunk = <T>(array: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );

// Transposes rows and columns: zip([1,2],[3,4]) → [[1,3],[2,4]]
export const zip = <T>(...arrays: T[][]): T[][] =>
  arrays[0].map((first, i) => arrays.slice(1).reduce((acc, other) => [...acc, other[i]], [first]));

// Normalises a match stop: single-value [out] becomes [null, out]; two-value stays as-is
export const toPair = <T>(stop: [T] | [T, T]): [T | null, T] =>
  stop.length === 2 ? stop : [null, ...stop];

// Pairs each stop with the next one as a [low, high] range; last stop gets null as upper bound
export const toBins = <T, K>(stops: [T, K][]): [[T | null, T | null], K][] => {
  return stops.reduce(
    (acc, [low, out], i) => {
      if (i === stops.length - 1) acc.push([[low, null], out]);
      else acc.push([[low, stops[i + 1][0]], out]);
      return acc;
    },
    [] as [[T | null, T | null], K][],
  );
};

// WeakMap-backed per-map store so entries are released when a map instance is destroyed
export const createCache = <T>() => {
  const cache = new WeakMap<MapboxMap, Record<string, T>>();

  const get = (map: MapboxMap, key: string, fallback: T): T => {
    if (!cache.has(map)) cache.set(map, {});
    const store = cache.get(map)!;
    if (store[key] === undefined) store[key] = fallback;
    return store[key];
  };

  return { get };
};
