import { pick } from '/@/utils';
import type { Metadata, LabelValue, Layer, LayerOptions } from '/@/types';

// Merge legend metadata from multiple sources. Metadata options like `unit` and `labels`
// can be set in the control options (not just in layer metadata) because Mapbox serializes
// layer metadata to Web Workers, which cannot handle function values.
// Priority: layer metadata < control options < per-property overrides
export const resolveMeta = (layer: Layer, options: LayerOptions, attribute: string): Metadata => {
  const META_KEYS = ['unit', 'labels'] as const;
  const { properties, ...rest } = layer.metadata?.legend || {};
  return {
    ...rest,
    ...pick(options, META_KEYS),
    ...options.properties?.[attribute],
    ...properties?.[attribute],
  };
};

// Resolve a label entry that may be a static value or a function of the raw value
const resolveLabel = (
  labels: Metadata['labels'],
  key: string,
  raw: unknown,
): LabelValue | undefined => {
  if (typeof labels === 'function') return labels(raw);
  const entry = labels?.[key];
  return typeof entry === 'function' ? entry(raw) : entry;
};

// Resolve a unit that may be a static string or a function of the raw value
const resolveUnit = (unit: Metadata['unit'], raw: unknown): string =>
  typeof unit === 'function' ? unit(raw) : (unit ?? '');

// Formats a stop value (or [low, high] bin) into a human-readable label.
// Null bounds indicate unbounded ranges: [null, x] → "< x", [x, null] → "> x"
export const serializeLabel = <T>(value: T | T[], metadata?: Pick<Metadata, 'labels' | 'unit'>) => {
  const { labels, unit } = metadata || {};
  if (Array.isArray(value)) {
    const binLabel = resolveLabel(labels, `${value}`, value);
    if (binLabel !== undefined) return binLabel;
    if (value[0] === null)
      return `< ${resolveLabel(labels, `${value[1]}`, value[1]) || `${value[1]}${resolveUnit(unit, value[1])}`}`;
    if (value[1] === null)
      return `> ${resolveLabel(labels, `${value[0]}`, value[0]) || `${value[0]}${resolveUnit(unit, value[0])}`}`;
    return value
      .map(v => resolveLabel(labels, `${v}`, v) || `${v}${resolveUnit(unit, v)}`)
      .join(' - ');
  }
  return value !== null
    ? (resolveLabel(labels, `${value}`, value) ?? `${value}${resolveUnit(unit, value)}`)
    : (resolveLabel(labels, 'other', value) ?? 'other');
};
