import { createElement, serializeLabel } from '../../../utils';
import './list.scss';

export default (expression, { metadata }) => {
  if (!expression) return null;
  return createElement('ul', {
    classes: ['list', 'list--color'],
    content: expression.stops.map(([value, color]) => createElement('li', {
      styles: { '--color': color },
      content: serializeLabel(value, metadata),
    })),
  });
};
