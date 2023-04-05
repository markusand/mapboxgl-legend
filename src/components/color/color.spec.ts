import { describe, it, expect } from 'vitest';
import components from './index';

const expression = {
  stops: [],
  getter: undefined,
  inputs: [],
  outputs: [],
  min: NaN,
  max: NaN,
};

describe('Color components', () => {
  it('should load interpolate color component', () => {
    expect(components({ name: 'interpolate', ...expression }, {} as any, {} as any, {})).toBeTruthy();
  });

  it('should load step color component', () => {
    expect(components({ name: 'step', ...expression }, {} as any, {} as any, {})).toBeTruthy();
  });

  it('should load match color component', () => {
    expect(components({ name: 'match', ...expression }, {} as any, {} as any, {})).toBeTruthy();
  });

  it('should load literal color component', () => {
    expect(components({ name: 'literal', ...expression }, {} as any, {} as any, {})).toBeTruthy();
  });

  it('should load get color component', () => {
    expect(components({ name: 'get', ...expression }, {} as any, {} as any, {})).toBeFalsy();
  });
});
