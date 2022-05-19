/* eslint-disable import/no-unresolved */
import { describe, it, expect } from 'vitest';
import Bubbles from './radius';

describe('Radius panel', () => {
  it('should create a panel with bubbles', () => {
    const expression = { stops: [[1, 10], [2, 20], [3, 30]] };
    const metadata = { labels: { 1: 'one', 3: 'three' } };
    const el = Bubbles(expression, { metadata });

    expect(el.tagName).toBe('UL');
    expect(el.classList.contains('bubbles')).toBeTruthy();
    expect(el.childElementCount).toBe(3);

    const { firstElementChild: first, lastElementChild: last } = el;
    expect(first.tagName).toBe('LI');
    expect(first.getAttribute('style')).toBe('--radius: 30px;');
    expect(first.firstElementChild.tagName).toBe('SPAN');
    expect(first.firstElementChild.textContent).toBe('three');
    expect(last.getAttribute('style')).toBe('--radius: 10px;');
  });
});
