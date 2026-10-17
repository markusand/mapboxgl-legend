import type { MapboxMap, Metadata } from '/@/types';

export const ensureArray = <T>(thing: T | T[]): T[] => (Array.isArray(thing) ? thing : [thing]);

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

export const createElement = (
  tag: string,
  options: {
    classes?: string | string[];
    styles?: Record<string, string>;
    attributes?: Record<string, string | number | boolean | null>;
    events?: Partial<Record<keyof HTMLElementEventMap, (event: Event) => void>>;
    content?: string | HTMLElement | boolean | (string | HTMLElement | undefined | boolean)[];
    appendTo?: HTMLElement;
  } = {},
) => {
  const { classes, styles, attributes, events, content, appendTo } = options;
  const el = document.createElement(tag);
  if (classes) ensureArray(classes).forEach(cls => el.classList.add(cls));
  if (styles) Object.entries(styles).forEach(prop => el.style.setProperty(...prop));
  if (attributes)
    Object.entries(attributes).forEach(([name, value]) => {
      if (value || value === 0) el.setAttribute(name, `${value}`);
      else el.removeAttribute(name);
    });
  if (events) Object.entries(events).forEach(([e, listener]) => el.addEventListener(e, listener));
  if (content) el.append(...(ensureArray(content).filter(Boolean) as string[] | HTMLElement[]));
  if (appendTo) appendTo.appendChild(el);
  return el;
};

export const createImageCanvas = (data: Iterable<number>, width: number, height: number) => {
  const size = Math.max(width, height);
  const canvas = createElement('canvas', {
    attributes: { width: size, height: size },
  }) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(Uint8ClampedArray.from(data), width, height);
  ctx?.putImageData(imageData, (size - width) / 2, (size - height) / 2);
  return canvas;
};

// Formats a stop value (or [low, high] bin) into a human-readable label.
// Null bounds indicate unbounded ranges: [null, x] → "< x", [x, null] → "> x"
export const serializeLabel = <T>(value: T | T[], metadata?: Metadata) => {
  const { labels = {}, unit = '' } = metadata || {};
  return Array.isArray(value)
    ? (labels[`${value}`] ??
        (value[0] === null
          ? `< ${labels[`${value[1]}`] || `${value[1]}${unit}`}`
          : value[1] === null
            ? `> ${labels[`${value[0]}`] || `${value[0]}${unit}`}`
            : value.map(v => labels[`${v}`] || `${v}${unit}`).join(' - ')))
    : value !== null
      ? (labels[`${value}`] ?? `${value}${unit}`)
      : (labels.other ?? 'other');
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
