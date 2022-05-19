import GradientBar from './gradient';
import BulletList from './list';

export default (expression, layer) => {
  switch (expression.name) {
    case 'interpolate':
      return GradientBar(expression, layer);
    case 'match':
    case 'step':
    case 'literal':
      return BulletList(expression, layer);
    default:
      return undefined;
  }
};
