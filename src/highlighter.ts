import type { Map, Layer } from 'mapbox-gl';
import type { ParsedExpression } from './types';

type Options = {
  delta?: number;
};

export default (expression: ParsedExpression<any, any>, layer: Layer, map: Map) => {
  const { getter } = expression;

  const highlight = (value: string | number | number[] | undefined, options?: Options) => {
    const { delta = 0 } = options || {};
    if (!getter) return;
    if (value === undefined) map.setFilter(layer.id, null);
    else if (Array.isArray(value)) {
      const [min, max] = value;
      const lower = min ? ['>=', getter, min] : true;
      const higher = max ? ['<', getter, max] : true;
      map.setFilter(layer.id, ['all', lower, higher]);
    } else {
      const filter = typeof value === 'number'
        ? ['all', ['>=', getter, value - delta], ['<=', getter, value + delta]]
        : ['==', getter, value];
      map.setFilter(layer.id, filter);
    }
  };

  const events = (value: string | number | number[]) => ({
    mouseenter: () => highlight(value),
    mouseleave: () => highlight(undefined),
  });

  return { highlight, events };
};
