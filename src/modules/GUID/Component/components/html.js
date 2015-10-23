import functUtils from '../../functUtils';
export default {
	'div': {
		'name': "div",
		// no import
		'attributes': [],
		'styling': [{
			'name': 'margin',
			'type': 'margin'
		}, {
			'name': 'padding',
			'type': 'padding'
		}, {
			'name': 'border',
			'type': 'border'
		}],
		creationStep: functUtils.fillwithName
	},
	'a': {
		'name': "a",
		// no import
		'attributes': [{
			'name': 'href',
			'type': 'string', //TODO see if its better to change it to select
			'defaultValue': '/#'
		}],
		creationStep: functUtils.fillwithName
	},
	'span': {
		'name': "Span",
		// no import
		'attributes': [],
		creationStep: functUtils.fillwithName
	},
	'img': {
		'name': "Img",
		// no import
		'attributes': [{
				'name': 'src',
				'type': 'string',
				'defaultValue': '/src/wakanda.jpg'
			}, {
				'name': 'alt',
				'type': 'string',
				'defaultValue': 'Alternate text'
			}
			// TODO height & width in styling
		],
		'styling': [{
			'name': 'margin',
			'type': 'margin'
		}, {
			'name': 'padding',
			'type': 'padding'
		}, {
			'name': 'border',
			'type': 'border'
		}],
		creationStep: undefined
	}
};
