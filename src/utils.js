export const ensureArray = thing => (Array.isArray(thing) ? thing : [thing]);

export const createElement = (tag, options = {}) => {
	const { classes, styles, content, appendTo } = options;
	const el = document.createElement(tag);
	if (classes) ensureArray(classes).forEach(c => el.classList.add(c));
	if (styles) Object.entries(styles).forEach(prop => el.style.setProperty(...prop));
	if (content !== undefined) el.append(...ensureArray(content));
	if (appendTo) appendTo.appendChild(el);
	return el;
};
