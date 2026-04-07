import { createElement, serializeLabel } from '/@/utils';
import highlighter from '/@/highlighter';
import type { Renderer } from '/@/types';

const renderer: Renderer = (expression, layer, map, options) => {
  const { stops } = expression;
  const { events } = highlighter(expression, layer, map);
  return createElement('ul', {
    classes: ['list', 'list--color', `list--${options.highlight ? 'highlight' : ''}`],
    content: stops.map(([value, color]) => {
      const content = serializeLabel(value, layer.metadata);
      return content && createElement('li', {
        styles: { '--color': color },
        events: options.highlight ? events(value) : {},
        content,
      });
    }),
  });
};

export default renderer;
