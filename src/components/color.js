import GradientBar from './block.color-gradient';
import BulletList from './block.color-list';

export default expression => {
	if (!expression) return null;
	switch (expression.name) {
		case 'interpolate':
			return GradientBar(expression);
		case 'match':
		case 'step':
			return BulletList(expression);
		default:
			return undefined;
	}
};
