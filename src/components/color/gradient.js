import { createElement, serializeLabel, map } from '/@/utils';

export default (expression, { metadata }) => {
  const { inputs, stops, min, max } = expression;
  const gradient = stops.map(([value, color]) => `${color} ${map(value, min, max)}%`);
  return createElement('div', {
    classes: 'gradient',
    content: [
      createElement('p', {
        classes: 'labels',
        content: inputs.map(input => createElement('span', {
          styles: { left: `${map(input, min, max)}%` },
          content: serializeLabel(input, metadata),
        })),
      }),
      createElement('div', {
        classes: 'bar',
        styles: { 'background-image': `linear-gradient(90deg, ${gradient})` },
      }),
    ],
  });
};
