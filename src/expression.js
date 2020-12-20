import { chunk, zip, toPair, toBins } from './utils';

const stopper = {
	interpolate: expression => chunk(expression.slice(2), 2),
	match: expression => chunk(expression.slice(1), 2).map(toPair),
	step: expression => toBins([...chunk(expression.slice(2), 2), [null, expression[1]]]),
};

const isValid = exp => Array.isArray(exp) && exp.length && typeof exp[0] === 'string';

const parse = expression => {
	if (!isValid(expression)) return null;
	const [name, ...args] = expression;
	const stops = stopper[name](args);
	const [inputs, outputs] = zip(...stops);
	const min = Math.min(...inputs);
	const max = Math.max(...inputs);
	return { name, stops, inputs, outputs, min, max };
};

export default { isValid, parse };
