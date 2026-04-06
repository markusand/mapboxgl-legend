import { createElement, serializeLabel, rescale, createCache } from '../../utils';
import highlighter from '../../highlighter';
import type { Renderer } from '/@/types';

type GradientRenderer = Renderer<number, string>;

const cache = createCache<{ x: number }>();

const renderer: GradientRenderer = (expression, layer, map, options) => {
  const { inputs, stops, min, max } = expression;

  // Save previous mouse position to avoid flickering
  const mousePos = cache.get(map, layer.id, { x: 0 });

  const { highlight } = highlighter(expression, layer, map);  
  const events = {
    mouseleave: () => highlight(undefined),
    mousemove: (event: Event) => {
      const { offsetX: x, target } = event as MouseEvent;
      mousePos.x = x;
      const bar = target as HTMLDivElement;
      const value = rescale(x, 0, bar.offsetWidth, min, max);
      highlight(value, { delta: (max - min) / 100 });
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
          '--x': `${mousePos.x}px`,
        },
        events: options.highlight ? events : {},
      }),
    ],
  });
};

export default renderer;
