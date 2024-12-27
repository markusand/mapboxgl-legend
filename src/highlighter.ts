import type { MapboxMap, Layer, ParsedExpression } from './types';

type Options = {
  delta?: number;
};

const backup: Record<string, any[] | null> = {};

export default (expression: ParsedExpression<any, any>, layer: Layer, map: MapboxMap) => {
  const { getter } = expression;

  if (!(layer.id in backup)) backup[layer.id] = layer.filter ?? null;

  const highlight = (value: string | number | number[] | undefined, options?: Options) => {
    const { delta = 0 } = options || {};
    if (!getter) return;
    if (value == null) map.setFilter(layer.id, backup[layer.id]);
    else if (Array.isArray(value)) {
      const [min, max] = value;
      const lower = min ? ['>=', getter, min] : true;
      const higher = max ? ['<', getter, max] : true;
      map.setFilter(layer.id, ['all', lower, higher]);
    } else {
      const filter = typeof value === 'number'
        ? ['all', ['>=', getter, value - delta], ['<=', getter, value + delta]]
        : ['==', getter, value];
      // @ts-expect-error Filter should accept numbers
      map.setFilter(layer.id, filter);
    }
  };

  const events = (value: string | number | number[]) => ({
    mouseenter: () => highlight(value),
    mouseleave: () => highlight(undefined),
  });

  return { highlight, events };
};
