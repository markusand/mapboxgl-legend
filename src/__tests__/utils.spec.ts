/* eslint-disable import/no-unresolved */
import { describe, it, expect, vi } from 'vitest';
import { ensureArray, rescale, chunk, zip, toPair, toBins, createElement, createImageCanvas, serializeLabel } from '../utils';

// Stub ImageData
vi.stubGlobal('ImageData', class ImageData {});

// Mock canvas getContext
// @ts-expect-error Mocking the only method needed
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  putImageData: vi.fn(),
}));


describe('Expression utilities', () => {
  it('should encapsulate variables in array if needed', () => {
    expect(ensureArray('string')).toEqual(['string']);
    expect(ensureArray(['string'])).toEqual(['string']);
  });

  it('should rescale a value to new bounds', () => {
    expect(rescale(1, 0, 4, 0, 100)).toBe(25);
  });

  it('should create chunks of arrays from array', () => {
    const array = [1, 2, 3, 4, 5, 6];
    expect(chunk(array, 2)).toEqual([[1, 2], [3, 4], [5, 6]]);
    expect(chunk(array, 3)).toEqual([[1, 2, 3], [4, 5, 6]]);
    expect(chunk(array, 4)).toEqual([[1, 2, 3, 4], [5, 6]]);
  });

  it('should zip multiple arrays', () => {
    const arrays = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    expect(zip(...arrays)).toEqual([[1, 4, 7], [2, 5, 8], [3, 6, 9]]);
  });

  it('should return always an array of 2 elements', () => {
    expect(toPair([1, 2])).toEqual([1, 2]);
    expect(toPair([1])).toEqual([null, 1]);
  });

  it('should create bins of range values', () => {
    const stops = [[0, 'a'], [1, 'b'], [2, 'c']] as [number | null, string][];
    expect(toBins(stops)).toEqual([
      [[0, 1], 'a'],
      [[1, 2], 'b'],
      [[2, null], 'c'],
    ]);
  });
});

describe('DOM utilities', () => {
  it('should create an element', () => {
    const element = createElement('div', {
      classes: ['class1', 'class2'],
      styles: { color: 'red' },
      attributes: { id: 'test', width: 100, height: 0, tabindex: null },
      content: 'Hello',
    });
    expect(element.classList.contains('class1')).toBeTruthy();
    expect(element.classList.contains('class2')).toBeTruthy();
    expect(element.style.color).toBe('red');
    expect(element.id).toBe('test');
    expect(element.textContent).toBe('Hello');
    expect(element.getAttribute('width')).toBe('100');
    expect(element.getAttribute('height')).toBe('0');
    expect(element.getAttribute('tabindex')).toBe(null);
  });

  it('should create an element with children elements', () => {
    const element = createElement('div', {
      content: [
        createElement('span', { content: 'Hello' }),
        createElement('span', { content: 'World' }),
      ],
    });
    expect(element.childElementCount).toBe(2);
    expect(element.firstElementChild?.tagName).toBe('SPAN');
    expect(element.firstElementChild?.textContent).toBe('Hello');
    expect(element.lastElementChild?.tagName).toBe('SPAN');
    expect(element.lastElementChild?.textContent).toBe('World');
  });

  it('should append created elementselements', () => {
    const parent = createElement('div');
    const child = createElement('div', {
      appendTo: parent,
    });
    expect(parent.childElementCount).toBe(1);
    expect(parent.firstElementChild).toBe(child);
  });
});

describe('Image canvas', () => {
  it('should create an image canvas', () => {
    const raw = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16];
    const data = new Uint8ClampedArray(raw);
    const canvas = createImageCanvas(data, 4, 4);
    expect(canvas.width).toBe(4);
    expect(canvas.height).toBe(4);
  });
});

describe('Labels', () => {
  it('should serialize a simple number label', () => {
    expect(serializeLabel(1)).toBe('1');
    expect(serializeLabel(1, { unit: 'm' })).toBe('1m');
    expect(serializeLabel(1, { labels: { 1: 'one' } })).toBe('one');
  });

  it('should serialize a range label', () => {
    expect(serializeLabel([1, 2])).toBe('1 - 2');
    expect(serializeLabel([1, 2], { labels: { 1: 'one', 2: 'two' } })).toBe('one - two');
    expect(serializeLabel([null, 1])).toBe('< 1');
    expect(serializeLabel([1, null])).toBe('> 1');
    expect(serializeLabel([0, 1], { labels: { '0,1': 'label' } })).toBe('label');
    expect(serializeLabel([null, 1], { labels: { ',1': 'label' } })).toBe('label');
    expect(serializeLabel([2, null], { labels: { '2,': 'label' } })).toBe('label');
    expect(serializeLabel([1, 2], { labels: { '1,2': false } })).toBe(false);
  });

  it('should serialize the OTHER label', () => {
    expect(serializeLabel(null)).toBe('other');
    expect(serializeLabel(null, { unit: 'm' })).toBe('other');
    expect(serializeLabel(null, { labels: { other: 'Altres' } })).toBe('Altres');
  });
});
