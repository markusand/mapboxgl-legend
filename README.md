# mapboxgl-legend
[![NPM](https://img.shields.io/npm/v/mapboxgl-legend)](https://npmjs.org/package/mapboxgl-legend)
[![NPM](https://img.shields.io/bundlephobia/minzip/mapboxgl-legend)](https://npmjs.org/package/mapboxgl-legend)
[![NPM](https://img.shields.io/npm/l/mapboxgl-legend)](https://npmjs.org/package/mapboxgl-legend)

Add a legend to a mapbox-gl map by parsing layer layout & paint expressions.

![image](https://user-images.githubusercontent.com/12972543/116700430-0d338b80-a9c7-11eb-913f-70c884589dc0.png)


Properties currently supported:
- `fill-color`
- `circle-color`
- `circle-radius`
- `icon-image`

Expressions currently supported:
- `match`
- `interpolate`
- `step`
- literals

## Get started
Install npm package
```bash
npm install mapboxgl-legend
```

Add legend control to map
```javascript
import LegendControl from 'mapboxgl-legend';

const legend = new LegendControl();
map.addControl(legend, 'bottom-left');
```

Add layers as usual, and the legend will be autogenerated
```javascript
map.addLayer({
	id: 'density',
	type: 'circle',
	source: 'demographic',
	paint: {
		'circle-radius': [
			'interpolate', ['linear'],
			['to-number', ['get', 'density']],
			100, 10,
			200, 17,
			500, 30,
			1000, 50,
			2000, 75
		],
		'circle-color': [
			'match',
			['get', 'ethnicity'],
			'White', '#f1e8c8',
			'Black', '#443722',
			'Hispanic', '#aa9761',
			'Asian', '#e8e59d',
			/* other */ '#ccc'
		]
	},
});
```

## Options
A few options can be passed on legend initialization.

| option | type | default | description |
| --- | --- | --- | --- |
| collapsed | Boolean | `false` | Set legend panels collapsed on load |
| toggler | Boolean | `false` | Add button to show and hide layers |
| layers | Array[regex] | `undefined` | List of layers to be added. If undefined all layers will be added |

There are also a few options that be defined as a per-layer basis using the style `metadata` object.

| option | type | description |
| --- | --- | --- |
| name | String | Set the panel title name |
| unit | String | Add a unit to all labels |
| labels | Object | Map a value to a text that replaces it as a label |

```javascript
map.addLayer({
	id: 'density',
	type: 'circle',
	source: 'demographic',
	paint: { /* ... */ },
	metadata: {
		name: 'Population Density',
		unit: `k/km²`
	}
});
```

## Styles
Legend defaults to a simple design inspired by standard mapbox-gl controls, but can be tunned by changing CSS variables. Check default values in `/src/_variables.scss`
