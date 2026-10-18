import { createElement } from '/@/dom';
import { serializeLabel } from '/@/metadata';
import highlighter from '/@/highlighter';
import type { Renderer } from '/@/types';

type WidthRenderer = Renderer<string | number, number>;

const renderer: WidthRenderer = (expression, layer, options, map) => {
  const { stops } = expression;
  const { events } = highlighter(expression, layer, map);
  const lineCap = (map.getLayoutProperty(layer.id, 'line-cap') as string) ?? 'butt';
  return createElement('ul', {
    classes: ['lines', `lines--${lineCap}`, `lines--${options.highlight ? 'highlight' : ''}`],
    content: stops.map(([value, width]) => {
      const content = serializeLabel(value, options);
      return (
        content &&
        createElement('li', {
          styles: { '--width': `${width}px` },
          events: options.highlight ? events(value) : {},
          content: createElement('span', { content }),
        })
      );
    }),
  });
};

export default renderer;
