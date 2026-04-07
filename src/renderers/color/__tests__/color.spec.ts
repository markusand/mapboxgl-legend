import { describe, it, expect } from 'vitest';
import renderers from '../index';
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
    expect(renderers({ name: 'interpolate', ...expression }, layer, map, {})).toBeTruthy();
  });

  it('should load step color component', () => {
    expect(renderers({ name: 'step', ...expression }, layer, map, {})).toBeTruthy();
  });

  it('should load match color component', () => {
    expect(renderers({ name: 'match', ...expression }, layer, map, {})).toBeTruthy();
  });

  it('should load literal color component', () => {
    expect(renderers({ name: 'literal', ...expression }, layer, map, {})).toBeTruthy();
  });

  it('should load get color component', () => {
    expect(renderers({ name: 'get', ...expression }, layer, map, {})).toBeFalsy();
  });
});
