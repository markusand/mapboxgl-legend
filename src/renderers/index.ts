import type { Renderer } from '/@/types';
import color from './color';
import radius from './radius';
import width from './width';
import image from './image';

const renderers: Record<string, Renderer> = {
  color,
  radius,
  width,
  image,
  pattern: image,
};

export default renderers;
