import { pick } from '/@/utils';
import type { Metadata, LabelValue, Resolvable, Layer, LayerOptions } from '/@/types';

type Labels = Record<string, Resolvable<LabelValue>> | Resolvable<LabelValue> | undefined;

// Resolve a Resolvable<T> to its value: call if function, return as-is otherwise.
// Curried so it can be reused across multiple values.
const unwrap =
  <T>(resolver: Resolvable<T> | undefined, fallback?: T) =>
  (value: unknown) =>
    (typeof resolver === 'function' ? (resolver as (v: unknown) => T)(value) : resolver) ??
    fallback;

// Resolve a label from a labels config. Supports three shapes:
// - Record: keyed lookup by stringified value (null → 'other')
// - Function: catch-all dynamic label
// - Static value: returned as-is for every input
const lookup = (labels: Labels) => (value: unknown, fallback?: LabelValue) => {
  const key = value === null ? 'other' : String(value); // oxlint-disable-line
  const entry = typeof labels === 'object' ? labels?.[key] : labels;
  return unwrap(entry, fallback)(value);
};

// Merge legend metadata from multiple sources. Metadata options like `unit` and `labels`
// can be set in the control options (not just in layer metadata) because Mapbox serializes
// layer metadata to Web Workers, which cannot handle function values.
// Priority: layer metadata < control options < per-property overrides
export const resolveMeta = (layer: Layer, options: LayerOptions, attribute: string): Metadata => {
  const META_KEYS = ['unit', 'labels', 'prefix'] as const;
  const { properties, ...rest } = layer.metadata?.legend || {};
  return {
    ...rest,
    ...pick(options, META_KEYS),
    ...options.properties?.[attribute],
    ...properties?.[attribute],
  };
};

// Format a stop value (or range) into a display string. Applies labels, unit,
// and handles ranges ([low, high]), open-ended bins ([null, x] / [x, null]),
// and null values (→ 'other'). Returns false when a label explicitly hides the entry.
export const serializeLabel = <T extends string | number | null>(
  value: T | T[],
  metadata?: Pick<Metadata, 'labels' | 'unit' | 'prefix'>,
) => {
  const prefix = unwrap(metadata?.prefix, '');
  const unit = unwrap(metadata?.unit, '');
  const labels = lookup(metadata?.labels);

  const format = (v: string | number | null) => `${prefix(v)}${v}${unit(v)}`;

  if (Array.isArray(value)) {
    const [low, high] = value;
    const binLabel = labels(value);
    if (binLabel !== undefined) return binLabel;
    if (value[0] === null) return `< ${labels(high, format(high))}`;
    if (value[1] === null) return `> ${labels(low, format(low))}`;
    return value.map(v => labels(v, format(v))).join(' - ');
  }

  return value === null ? labels(value, 'other') : labels(value, format(value));
};
