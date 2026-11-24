import { createElement } from '/@/dom';
import { rescale, createCache } from '/@/utils';
import { serializeLabel } from '/@/metadata';
import highlighter from '/@/highlighter';
import type { Renderer } from '/@/types';

type GradientRenderer = Renderer<number, string>;

// Cache the last mouse x position per layer so the indicator doesn't jump on re-render
const cache = createCache<{ x: number }>();

const renderer: GradientRenderer = (expression, layer, options, map) => {
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
      // Map pixel offset to data value, then highlight with a 1% tolerance window
      const value = rescale(x, 0, bar.offsetWidth, min, max);
      highlight(value, { delta: (max - min) / 100 });
      bar.style.setProperty('--x', `${x}px`);
    },
  };

  // Convert stops to CSS gradient colour positions (values rescaled to 0–100%)
  const gradient = stops.map(([value, color]) => `${color} ${rescale(value, min, max)}%`);
  return createElement('div', {
    classes: ['gradient', `gradient--${options.highlight ? 'highlight' : ''}`],
    content: [
      createElement('p', {
        classes: 'labels',
        content: inputs.map(input => {
          const content = serializeLabel(input, options);
          return (
            content &&
            createElement('span', {
              // Position each label over its corresponding point on the gradient bar
              styles: { left: `${rescale(input, min, max)}%` },
              content,
            })
          );
        }),
      }),
      createElement('div', {
        classes: 'bar',
        styles: {
          'background-image': `linear-gradient(90deg, ${gradient.join(', ')})`,
          '--x': `${mousePos.x}px`,
        },
        events: options.highlight ? events : {},
      }),
    ],
  });
};

export default renderer;
