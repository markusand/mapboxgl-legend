/* eslint-disable import/no-unresolved */
import { describe, it, expect } from 'vitest';
import ColorList from './index';

describe('Color gradient panel', () => {
  it('should create a panel with colors gradient bar', () => {
    const expression = {
      stops: [[1, '#f00'], [2, '#0f0'], [3, '#00f']],
      inputs: [1, 2, 3],
      min: 1,
      max: 3,
    };
    const el = ColorList(expression, {});

    expect(el.tagName).toBe('DIV');
    expect(el.classList.contains('gradient')).toBeTruthy();
    expect(el.childElementCount).toBe(2);

    const { firstElementChild: labels, lastElementChild: bar } = el;
    expect(labels.tagName).toBe('P');
    expect(labels.childElementCount).toBe(3);

    expect(bar.tagName).toBe('DIV');
    expect(bar.classList.contains('bar')).toBeTruthy();
    // Cannot check background.image ¿?
  });
});
