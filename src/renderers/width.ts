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
      const styles: Record<string, string> = { '--width': `${width}px` };
      if (dasharray) {
        let pos = 0;
        const gradientStops = dasharray.flatMap((seg, i) => {
          const start = pos * width;
          pos += seg;
          const end = pos * width;
          const color = i % 2 === 0 ? 'currentcolor' : 'transparent';
          return [`${color} ${start}px`, `${color} ${end}px`];
        });
        styles['--dash-pattern'] = `repeating-linear-gradient(90deg, ${gradientStops.join(', ')})`;
      }
      return (
        content &&
        createElement('li', {
          styles,
          events: options.highlight ? events(value) : {},
          content: createElement('span', { content }),
        })
      );
    }),
  });
};

export default renderer;
