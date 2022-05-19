import { createElement, serializeLabel } from '/@/utils';

export default (expression, { metadata }) => {
  const { stops } = expression;
  return createElement('ul', {
    classes: ['list', 'list--color'],
    content: stops.map(([value, color]) => createElement('li', {
      styles: { '--color': color },
      content: serializeLabel(value, metadata),
    })),
  });
};
