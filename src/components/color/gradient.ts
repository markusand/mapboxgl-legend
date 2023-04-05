import { createElement, serializeLabel, rescale } from '../../utils';
import highlighter from '../../highlighter';
import type { Map, Layer, ParsedExpression, LayerOptions } from '../../types';

type Expression = ParsedExpression<number, string>;

const cached = { x: 0 };

export default (expression: Expression, layer: Layer, map: Map, options: LayerOptions) => {
  const { inputs, stops, min, max } = expression;

  const { highlight } = highlighter(expression, layer, map);  
  const delta = (max - min) / 100;
  const events = {
    mouseleave: () => highlight(undefined),
    mousemove: (event: Event) => {
      const { offsetX: x, target } = event as MouseEvent;
      cached.x = x;
      const bar = target as HTMLDivElement;
      const value = rescale(x, 0, bar.offsetWidth, min, max);
      highlight(value, { delta });
      bar.style.setProperty('--x', `${x}px`);
    },
  };

  const gradient = stops.map(([value, color]) => `${color} ${rescale(value, min, max)}%`);
  return createElement('div', {
    classes: ['gradient', `gradient--${options.highlight ? 'highlight' : ''}`],
    content: [
      createElement('p', {
        classes: 'labels',
        content: inputs.map(input => {
          const content = serializeLabel(input, layer.metadata);
          return content && createElement('span', {
            styles: { left: `${rescale(input, min, max)}%` },
            content,
          });
        }),
      }),
      createElement('div', {
        classes: 'bar',
        styles: {
          'background-image': `linear-gradient(90deg, ${gradient})`,
          '--x': `${cached.x || 0}px`,
        },
        events: options.highlight ? events : {},
      }),
    ],
  });
};
