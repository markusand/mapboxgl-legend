import { chunk, zip, toPair, toBins } from './utils';
import type { Expression, ParsedExpression } from './types';

// Recursive input type to support nested range pairs (e.g. step bins)
type Input<T> = T | null | [Input<T>, Input<T>];
// Stopper extracts [input, output] pairs from the raw expression args
type Stopper = <T>(args: T[]) => [Input<T>, T][];

// Splits a flat args array into consecutive [input, output] pairs starting at `pos`
const extract = <T>(args: T[], pos: number) => chunk(args.slice(pos), 2) as [T, T][];

/*
Normalises each Mapbox expression type into a uniform list of [input, output] stop pairs:
 - interpolate: [interp-type, getter, in0, out0, in1, out1, ...]
 - match:       [getter, in0, out0, in1, out1, ..., fallback] — toPair handles multi-value keys
 - step:        [getter, fallback, in0, out0, ...] — null sentinel for the first (underflow) bin
 - literal:     a plain value; no getter, single stop where input === output 
*/
const stopper: Record<string, Stopper> = {
  interpolate: args => extract(args, 2),
  match: args => extract(args, 1).map(toPair),
  step: args => toBins([[null, args[1]], ...extract(args, 2)]),
  literal: args => args.map(v => [v, v]),
};

const isExpression = (e: unknown): e is Expression =>
  Array.isArray(e) && !!e.length && typeof e[0] === 'string';

const parse = (input: unknown): ParsedExpression<unknown, unknown>[] => {
  const [name, ...args] = isExpression(input) ? input : ['literal', input];

  // `case` is a boolean-branch expression; skip its condition args and recurse into output branches
  if (name === 'case') return args.slice(1).flatMap(parse);

  const stops = stopper[name]?.(args);
  if (!stops) return [];

  // Resolve the data property being mapped: match/step bind the getter at args[0],
  // interpolate wraps it one level deeper at args[1] (after the interpolation type)
  const getter =
    name === 'literal' ? undefined : ['match', 'step'].includes(name) ? args[0] : args[1];

  const [inputs, outputs] = zip(...stops);
  // Flatten nested range inputs (step bins) before computing the numeric extent
  const min = Math.min(...(inputs.flat(2) as number[]));
  const max = Math.max(...(inputs.flat(2) as number[]));

  return [{ name, getter, stops, inputs, outputs, min, max }];
};

export default { isExpression, parse };
