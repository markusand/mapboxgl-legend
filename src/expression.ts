import { chunk, zip, toPair, toBins } from './utils';
import type { Expression, ExpressionName, ParsedExpression } from './types';

type Input<T> = T | null | [Input<T>, Input<T>];
type Stopper = <T>(args: T[]) => [Input<T>, T][];

const extract = <T>(args: T[], pos: number) => chunk(args.slice(pos), 2) as [T, T][];

const stopper: Record<string, Stopper> = {
  interpolate: args => extract(args, 2),
  match: args => extract(args, 1).map(toPair),
  step: args => toBins([[null, args[1]], ...extract(args, 2)]),
  literal: args => [[...args, ...args]] as any,
};

const isExpression = (e: any): e is Expression => Array.isArray(e) && !!e.length && typeof e[0] === 'string';

const parse = (input: any): ParsedExpression<any, any>[] => {
  const [name, ...args] = isExpression(input)
    ? input
    : ['literal' as ExpressionName, input];
  const stops = stopper[name]?.(args);
  const getter = name === 'literal' ? undefined : ['match', 'step'].includes(name) ? args[0] : args[1];
  if (!stops) return [];
  const [inputs, outputs] = zip(...stops);
  const min = Math.min(...inputs.flat(2) as number[]);
  const max = Math.max(...inputs.flat(2) as number[]);
  return [{ name, getter, stops, inputs, outputs, min, max }];
};

export default { isExpression, parse };
