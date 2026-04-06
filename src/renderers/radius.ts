import { createElement, serializeLabel } from '../utils';
import highlighter from '../highlighter';
import type { Renderer } from '../types';

type RadiusRenderer = Renderer<string | number, number>;

const renderer: RadiusRenderer = (expression, layer, map, options) => {
  const { stops } = expression;
  const { events } = highlighter(expression, layer, map);
  return createElement('ul', {
    classes: ['bubbles', `bubbles--${options.highlight ? 'highlight' : ''}`],
    content: stops
      .sort((a, b) => b[1] - a[1]) // order from bigger to smaller
      .map(([value, radius]) => {
        const content = serializeLabel(value, layer.metadata);
        return content && createElement('li', {
          styles: { '--radius': `${radius}px` },
          events: options.highlight ? events(value) : {},
          content: createElement('span', {
            content,
          }),
        });
      }),
  });
};

export default renderer;
