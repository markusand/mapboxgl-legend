export const ensureArray = <T>(thing: T | T[]): T[] => (Array.isArray(thing) ? thing : [thing]);

export const toObject = (thing?: string[] | Record<string, boolean | string[]>) => (
  Array.isArray(thing)
    ? thing.reduce((acc, i) => ({ ...acc, [i]: true }), {})
    : thing
);

export const map = (val: number, x1: number, y1: number, x2 = 0, y2 = 100) => (
  ((val - x1) * (y2 - x2)) / (y1 - x1) + x2
);

export const chunk = <T>(array: T[], size: number): T[][] => Array.from(
  { length: Math.ceil(array.length / size) },
  (v, i) => array.slice(i * size, i * size + size),
);

export const zip = <T>(...arrays: T[][]): T[][] => (
  arrays[0].map((first, i) => arrays.slice(1).reduce((acc, other) => [...acc, other[i]], [first]))
);

export const toPair = <T>(stop: [T] | [T, T]): [T | null, T] => (
  (stop.length === 2 ? stop : [null, ...stop])
);

export const toBins = <T, K>(stops: [T, K][]): [T | [T, T], K][] => {
  const other = stops.find(([input]) => input === null);
  return stops.reduce((acc, [low, out], i) => {
    if (i === stops.length - 1) acc.push([low, out]);
    else if (out !== other?.[1]) acc.push([[low, stops[i + 1][0]], out]);
    return acc;
  }, [] as [T | [T, T], K][]);
};

export const createElement = (
  tag: string,
  options: {
    classes?: string | string[];
    styles?: Record<string, string>;
    attributes?: Record<string, string | number | boolean | null>;
    content?: string | HTMLElement | (string | HTMLElement | undefined)[];
    appendTo?: HTMLElement;
  } = {},
) => {
  const { classes, styles, attributes, content, appendTo } = options;
  const el = document.createElement(tag);
  if (classes) ensureArray(classes).forEach(cls => el.classList.add(cls));
  if (styles) Object.entries(styles).forEach(prop => el.style.setProperty(...prop));
  if (attributes) Object.entries(attributes).forEach(([name, value]) => {
    if (value) el.setAttribute(name, `${value}`);
    else el.removeAttribute(name);
  });
  if (content) el.append(...(ensureArray(content).filter(Boolean) as string[] | HTMLElement[]));
  if (appendTo) appendTo.appendChild(el);
  return el;
};

type Metadata = {
  name?: string;
  unit?: string;
  labels?: Record<string, string>;
};

export const serializeLabel = <T>(value: T | T[], metadata?: Metadata) => {
  const { labels = {}, unit = '' } = metadata || {};
  return Array.isArray(value)
    ? value[1] !== null
      ? value.map(v => labels[`${v}`] || `${v}${unit}`).join(' - ')
      : `+${labels[`${value[0]}`] || `${value[0]}${unit}`}`
    : value !== null
      ? labels[`${value}`] || `${value}${unit}`
      : labels.other || 'other';
};
