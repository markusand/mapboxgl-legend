/* eslint-disable import/no-unresolved */
import { describe, it, expect, vi } from 'vitest';
import Image from './index';

// Stub ImageData
vi.stubGlobal('ImageData', class ImageData {});

// Mock canvas
HTMLCanvasElement.prototype.toDataURL = () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
HTMLCanvasElement.prototype.getContext = () => ({ putImageData: () => {} });

// Mock mapbox map
const map = {
  style: {
    imageManager: {
      images: {
        'image-a': { data: { height: 2, width: 2, data: [0, 0, 0, 0] } },
        'image-b': { data: { height: 2, width: 2, data: [1, 1, 1, 1] } },
      },
    },
  },
};

describe('Image panel', () => {
  it('should create a panel with icons list', () => {
    const expression = { stops: [['a', 'image-a'], ['b', 'image-b']] };
    const metadata = { labels: { a: 'Image A' } };
    const el = Image(expression, { metadata }, map);

    expect(el.tagName).toBe('UL');
    expect(el.classList.contains('list')).toBeTruthy();
    expect(el.classList.contains('list--icons')).toBeTruthy();
    expect(el.childElementCount).toBe(2);
    expect(el.firstElementChild.tagName).toBe('LI');

    const { firstElementChild: image, textContent: label } = el.firstElementChild;
    expect(image.tagName).toBe('IMG');
    expect(image.classList.contains('icon')).toBeTruthy();
    expect(image.src).toBe('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==');
    expect(label).toBe('Image A');
  });

  it('should create a panel with bubbles with a missing image', () => {
    const expression = { stops: [['a', 'image-a'], ['b', 'image-not-exists']] };
    const el = Image(expression, {}, map);
    expect(el.childElementCount).toBe(1);
  });
});
