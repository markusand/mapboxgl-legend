import type { Renderer } from '/@/types';
import color from './color';
import radius from './radius';
import image from './image';

const renderers: Record<string, Renderer> = {
  color,
  radius,
  image,
  pattern: image,
};

export default renderers;
