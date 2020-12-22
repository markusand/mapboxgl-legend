export const ensureArray = thing => (Array.isArray(thing) ? thing : [thing]);

export const map = (val, x1, y1, x2 = 0, y2 = 100) => ((val - x1) * (y2 - x2)) / (y1 - x1) + x2;

export const chunk = (array, size) => Array.from(
	{ length: Math.ceil(array.length / size) },
	(v, i) => array.slice(i * size, i * size + size),
);

export const zip = (array, ...arrays) => (
	array.map((v, i) => arrays.reduce((acc, arr) => [...acc, arr[i]], [v]))
);

export const toPair = stop => (stop.length === 2 ? stop : [null, ...stop]);

export const toBins = stops => {
	const other = stops.find(([input]) => !input);
	return stops.reduce((acc, [low, out], i) => {
		if (i === stops.length - 1) acc.push([low, out]);
		else if (out !== other[1]) acc.push([[low, stops[i + 1][0]], out]);
		return acc;
	}, []);
};

export const createElement = (tag, options = {}) => {
	const { classes, styles, attributes, content, appendTo } = options;
	const el = document.createElement(tag);
	if (classes) ensureArray(classes).forEach(c => el.classList.add(c));
	if (styles) Object.entries(styles).forEach(prop => el.style.setProperty(...prop));
	if (attributes) Object.entries(attributes).forEach(([attr, value]) => { el[attr] = value; });
	el.append(...ensureArray(content).filter(child => child !== null && child !== undefined));
	if (appendTo) appendTo.appendChild(el);
	return el;
};

export const serializeLabel = (value, labels = {}) => (
	Array.isArray(value)
		? value[1]
			? value.map(v => labels[v] || v).join(' - ')
			: `+${labels[value[0]] || value[0]}`
		: value !== null
			? labels[value] || value
			: 'other'
);
