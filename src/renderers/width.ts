import { createElement } from '/@/dom';
import { serializeLabel } from '/@/metadata';
import highlighter from '/@/highlighter';
import type { Renderer } from '/@/types';

type WidthRenderer = Renderer<string | number, number>;

const renderer: WidthRenderer = (expression, layer, options, map) => {
  const { stops } = expression;
  const { events } = highlighter(expression, layer, map);
  const lineCap = (map.getLayoutProperty(layer.id, 'line-cap') as string) ?? 'butt';
  const dasharray = map.getPaintProperty(layer.id, 'line-dasharray') as number[] | undefined;
  const [dash, gap] = dasharray ?? [0, 0];
  return createElement('ul', {
    classes: [
      'lines',
      {
        'lines--highlight': !!options.highlight,
        [`lines--${lineCap}`]: !dasharray,
        'lines--dashed': !!dasharray,
      },
    ],
    content: stops.map(([value, width]) => {
      const content = serializeLabel(value, options);
      return (
        content &&
        createElement('li', {
          styles: {
            '--width': `${width}px`,
            '--dash': `${dash * width}px`,
            '--gap': `${gap * width}px`,
          },
          events: options.highlight ? events(value) : {},
          content: createElement('span', { content }),
        })
      );
    }),
  });
};

export default renderer;
