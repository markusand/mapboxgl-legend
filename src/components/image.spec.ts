import { describe, it, expect, vi } from 'vitest';
import type { ParsedExpression } from '../expression';
import image from './image';

// Stub ImageData
vi.stubGlobal('ImageData', class ImageData {});

// Mock canvas
HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
// @ts-ignore Can't mock full CanvasRenderingContext2D
HTMLCanvasElement.prototype.getContext = () => ({ putImageData: () => {} });

// Mock mapbox map
const map = {
  style: {
    getImage: (name: string) => {
      const images = {
        'image-a': { data: { height: 2, width: 2, data: [0, 0, 0, 0] } },
        'image-b': { data: { height: 2, width: 2, data: [1, 1, 1, 1] } },
      };
      return images[name as keyof typeof images];
    },
  },
};

describe('Image panel', () => {
  it('should create a panel with icons list', () => {
    const expression: ParsedExpression<string, string> = {
      name: 'match',
      stops: [['a', 'image-a'], ['b', 'image-b']],
      inputs: ['a', 'b'],
      outputs: ['image-a', 'image-b'],
      min: NaN,
      max: NaN,
    };
    const metadata = { labels: { a: 'Image A' } };
    // @ts-ignore Can't mock full Map implementation
    const el = image(expression, { id: '_', type: '_', metadata }, map);

    expect(el.tagName).toBe('UL');
    expect(el.classList.contains('list')).toBeTruthy();
    expect(el.classList.contains('list--icons')).toBeTruthy();
    expect(el.childElementCount).toBe(2);
    expect(el.firstElementChild?.tagName).toBe('LI');

    const img = el.firstElementChild?.firstElementChild as HTMLImageElement;
    expect(img.tagName).toBe('IMG');
    expect(img.classList.contains('icon')).toBeTruthy();
    expect(img.src).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    
    const label = el.firstElementChild?.textContent;
    expect(label).toBe('Image A');
  });

  it('should create a panel with bubbles with a missing image', () => {
    const expression: ParsedExpression<string, string> = {
      name: 'match',
      stops: [['a', 'image-a'], ['b', 'image-not-exists']],
      inputs: ['a', 'b'],
      outputs: ['image-a', 'image-b'],
      min: NaN,
      max: NaN,
    };
    const metadata = { labels: { a: 'Image A' } };
    // @ts-ignore Can't mock full Map implementation
    const el = image(expression, { id: '_', type: '_', metadata }, map);

    expect(el.childElementCount).toBe(1);
  });

  it('should hide an item with label set to false', () => {
    const expression: ParsedExpression<string, string> = {
      name: 'match',
      stops: [['a', 'image-a'], ['b', 'image-b']],
      inputs: ['a', 'b'],
      outputs: ['image-a', 'image-b'],
      min: NaN,
      max: NaN,
    };
    const metadata = { labels: { a: 'Image A', b: false } };
    // @ts-ignore Can't mock full Map implementation
    const el = image(expression, { id: '_', type: '_', metadata }, map);

    expect(el.childElementCount).toBe(1);
  });
});
