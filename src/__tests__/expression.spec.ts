import { describe, it, expect } from 'vitest';
import type { Expression } from 'mapbox-gl';
import expression from '../expression';

const INTERPOLATE: Expression = ['interpolate', ['linear'], ['get', 'attribute'], 0, '#f00', 1, '#0f0', 2, '#00f'];
const MATCH: Expression = ['match', ['get', 'attribute'], 0, '#f00', 1, '#0f0', 2, '#00f', '#aaa'];
const STEP: Expression = ['step', ['get', 'attribute'], '#aaa', 0, '#f00', 1, '#0f0', 2, '#00f'];
const INCOMPATIBLE = ['other', 'whatever'];

describe('Expressions', () => {
  /*
  From mapboxgl docs https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/
  Expressions are represented as JSON arrays. The first element is a string
  naming the operator. Elements that follow (if any) are the arguments.
  */
  it('should validate expressions against formal definition', () => {
    expect(expression.isExpression('string')).toBeFalsy();
    expect(expression.isExpression(INTERPOLATE)).toBeTruthy();
  });

  it('should return null if uncompatible expression', () => {
    expect(expression.parse(INCOMPATIBLE as Expression)).toHaveLength(0);
  });

  it('should return a parsed expression', () => {
    const [parsed] = expression.parse('#f00');
    expect(parsed).toHaveProperty('name');
    expect(parsed).toHaveProperty('stops');
    expect(parsed).toHaveProperty('inputs');
    expect(parsed).toHaveProperty('outputs');
    expect(parsed).toHaveProperty('min');
    expect(parsed).toHaveProperty('max');
  });

  it('should parse a literal expression', () => {
    expect(expression.parse('#f00')).toEqual([{
      name: 'literal',
      stops: [['#f00', '#f00']],
      inputs: ['#f00'],
      outputs: ['#f00'],
      min: NaN,
      max: NaN,
    }]);
  });

  it('should parse an interpolation expression', () => {
    expect(expression.parse(INTERPOLATE)).toEqual([{
      name: 'interpolate',
      getter: ['get', 'attribute'],
      stops: [[0, '#f00'], [1, '#0f0'], [2, '#00f']],
      inputs: [0, 1, 2],
      outputs: ['#f00', '#0f0', '#00f'],
      min: 0,
      max: 2,
    }]);
  });

  it('should parse a match expression', () => {
    expect(expression.parse(MATCH)).toEqual([{
      name: 'match',
      getter: ['get', 'attribute'],
      stops: [[0, '#f00'], [1, '#0f0'], [2, '#00f'], [null, '#aaa']],
      inputs: [0, 1, 2, null],
      outputs: ['#f00', '#0f0', '#00f', '#aaa'],
      min: 0,
      max: 2,
    }]);
  });

  it('should parse a step expression', () => {
    expect(expression.parse(STEP)).toEqual([{
      name: 'step',
      getter: ['get', 'attribute'],
      stops: [[[null, 0], '#aaa'], [[0, 1], '#f00'], [[1, 2], '#0f0'], [[2, null], '#00f']],
      inputs: [[null, 0], [0, 1], [1, 2], [2, null]],
      outputs: ['#aaa', '#f00', '#0f0', '#00f'],
      min: 0,
      max: 2,
    }]);
  });

  it('should parse case expressions', () => {
    const CASE = ['case', ['condition'], INTERPOLATE, STEP]; 
    const parsed = expression.parse(CASE);
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe('interpolate');
    expect(parsed[1].name).toBe('step');
  });
});
