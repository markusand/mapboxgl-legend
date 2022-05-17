import { chunk, zip, toPair, toBins } from './utils';

const stopper = {
  literal: expression => [[...expression, ...expression]],
  interpolate: expression => chunk(expression.slice(2), 2),
  match: expression => chunk(expression.slice(1), 2).map(toPair),
  step: expression => toBins([...chunk(expression.slice(2), 2), [null, expression[1]]]),
};

const isExpression = expression => Array.isArray(expression) && expression.length && typeof expression[0] === 'string';

const parse = input => {
  const [name, ...args] = isExpression(input) ? input : ['literal', input];
  if (!stopper[name]) return null;
  const stops = stopper[name](args);
  const [inputs, outputs] = zip(...stops);
  const min = Math.min(...inputs);
  const max = Math.max(...inputs);
  return { name, stops, inputs, outputs, min, max };
};

export default { isExpression, parse };
