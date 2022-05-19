/* eslint-disable import/no-unresolved */
import { describe, it, expect } from 'vitest';
import ColorList from './list';

describe('Color list panel', () => {
  it('should create a panel colors list', () => {
    const expression = { stops: [[1, '#f00'], [2, '#0f0'], [3, '#00f']] };
    const metadata = { labels: { 1: 'one', 3: 'three' } };
    const el = ColorList(expression, { metadata });

    expect(el.tagName).toBe('UL');
    expect(el.classList.contains('list')).toBeTruthy();
    expect(el.classList.contains('list--color')).toBeTruthy();
    expect(el.childElementCount).toBe(3);

    const { firstElementChild: first, lastElementChild: last } = el;
    expect(first.tagName).toBe('LI');
    expect(first.getAttribute('style')).toBe('--color: #f00;');
    expect(first.textContent).toBe('one');
    expect(last.getAttribute('style')).toBe('--color: #00f;');
  });
});
