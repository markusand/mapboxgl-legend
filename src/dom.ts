import { ensureArray } from '/@/utils';

type ClassValue = string | Record<string, boolean>;

const resolveClasses = (classes: ClassValue | ClassValue[]): string[] =>
  ensureArray(classes).flatMap(cls =>
    typeof cls === 'string' ? [cls] : Object.keys(cls).filter(k => cls[k]),
  );

export const createElement = (
  tag: string,
  options: {
    classes?: ClassValue | ClassValue[];
    styles?: Record<string, string>;
    attributes?: Record<string, string | number | boolean | null>;
    events?: Partial<Record<keyof HTMLElementEventMap, (event: Event) => void>>;
    content?: string | HTMLElement | boolean | (string | HTMLElement | undefined | boolean)[];
    appendTo?: HTMLElement;
  } = {},
) => {
  const { classes, styles, attributes, events, content, appendTo } = options;
  const el = document.createElement(tag);
  if (classes) resolveClasses(classes).forEach(cls => el.classList.add(cls));
  if (styles) Object.entries(styles).forEach(prop => el.style.setProperty(...prop));
  if (attributes)
    Object.entries(attributes).forEach(([name, value]) => {
      if (value || value === 0) el.setAttribute(name, `${value}`);
      else el.removeAttribute(name);
    });
  if (events) Object.entries(events).forEach(([e, listener]) => el.addEventListener(e, listener));
  if (content) el.append(...(ensureArray(content).filter(Boolean) as string[] | HTMLElement[]));
  if (appendTo) appendTo.appendChild(el);
  return el;
};

export const createImageCanvas = (data: Iterable<number>, width: number, height: number) => {
  const size = Math.max(width, height);
  const canvas = createElement('canvas', {
    attributes: { width: size, height: size },
  }) as HTMLCanvasElement;
  const ctx = canvas.getContext('2d');
  const imageData = new ImageData(Uint8ClampedArray.from(data), width, height);
  ctx?.putImageData(imageData, (size - width) / 2, (size - height) / 2);
  return canvas;
};
