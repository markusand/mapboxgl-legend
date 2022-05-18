/* eslint-disable import/no-unresolved */
import { describe, it, expect } from 'vitest';
import Expression from './expression';

const expressions = {
  INTERPOLATE: ['interpolate', ['linear'], ['get', 'attribute'], 0, '#f00', 1, '#0f0', 2, '#00f'],
  MATCH: ['match', ['get', 'attribute'], 0, '#f00', 1, '#0f0', 2, '#00f', '#aaa'],
  STEP: ['step', ['get', 'attribute'], '#aaa', 0, '#f00', 1, '#0f0', 2, '#00f'],
  UNCOMPATIBLE: ['uncompatible', 'whatever'],
};

describe('Expressions', () => {
  /*
  From mapboxgl docs https://docs.mapbox.com/mapbox-gl-js/style-spec/expressions/
  Expressions are represented as JSON arrays. The first element is a string
  naming the operator. Elements that follow (if any) are the arguments.
  */
  it('should validate expressions against formal definition', () => {
    expect(Expression.isExpression('string')).toBeFalsy();
    expect(Expression.isExpression(expressions.INTERPOLATE)).toBeTruthy();
  });

  it('should return null if uncompatible expression', () => {
    expect(Expression.parse(expressions.UNCOMPATIBLE)).toBeNull();
  });

  it('should return a parsed expression', () => {
    const parsed = Expression.parse('#f00');
    expect(parsed).toHaveProperty('name');
    expect(parsed).toHaveProperty('stops');
    expect(parsed).toHaveProperty('inputs');
    expect(parsed).toHaveProperty('outputs');
    expect(parsed).toHaveProperty('min');
    expect(parsed).toHaveProperty('max');
  });

  it('should parse a literal expression', () => {
    expect(Expression.parse('#f00')).toEqual({
      name: 'literal',
      stops: [['#f00', '#f00']],
      inputs: ['#f00'],
      outputs: ['#f00'],
      min: NaN,
      max: NaN,
    });
  });

  it('should parse an interpolation expression', () => {
    expect(Expression.parse(expressions.INTERPOLATE)).toEqual({
      name: 'interpolate',
      stops: [[0, '#f00'], [1, '#0f0'], [2, '#00f']],
      inputs: [0, 1, 2],
      outputs: ['#f00', '#0f0', '#00f'],
      min: 0,
      max: 2,
    });
  });

  it('should parse a match expression', () => {
    expect(Expression.parse(expressions.MATCH)).toEqual({
      name: 'match',
      stops: [[0, '#f00'], [1, '#0f0'], [2, '#00f'], [null, '#aaa']],
      inputs: [0, 1, 2, null],
      outputs: ['#f00', '#0f0', '#00f', '#aaa'],
      min: 0,
      max: 2,
    });
  });

  it('should parse a step expression', () => {
    expect(Expression.parse(expressions.STEP)).toEqual({
      name: 'step',
      stops: [[[0, 1], '#f00'], [[1, 2], '#0f0'], [[2, null], '#00f'], [null, '#aaa']],
      inputs: [[0, 1], [1, 2], [2, null], null],
      outputs: ['#f00', '#0f0', '#00f', '#aaa'],
      min: 0,
      max: 2,
    });
  });
});
