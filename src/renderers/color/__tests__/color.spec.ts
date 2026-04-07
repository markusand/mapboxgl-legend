import { describe, it, expect } from 'vitest';
import components from '../index';
import { Layer, MapboxMap } from '/@/types';

const expression = {
  stops: [],
  getter: undefined,
  inputs: [],
  outputs: [],
  min: NaN,
  max: NaN,
};

const layer = {} as unknown as Layer;
const map = {} as unknown as MapboxMap;

describe('Color components', () => {
  it('should load interpolate color component', () => {
    expect(components({ name: 'interpolate', ...expression }, layer, map, {})).toBeTruthy();
  });

  it('should load step color component', () => {
    expect(components({ name: 'step', ...expression }, layer, map, {})).toBeTruthy();
  });

  it('should load match color component', () => {
    expect(components({ name: 'match', ...expression }, layer, map, {})).toBeTruthy();
  });

  it('should load literal color component', () => {
    expect(components({ name: 'literal', ...expression }, layer, map, {})).toBeTruthy();
  });

  it('should load get color component', () => {
    expect(components({ name: 'get', ...expression }, layer, map, {})).toBeFalsy();
  });
});
