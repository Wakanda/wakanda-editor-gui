import functUtils from '../../functUtils';
export default {
	'paper-drawer-panel': {
		'name': 'Paper Drawer Panel',
		'import': './bower_components/paper-drawer-panel/paper-drawer-panel.html',
		'attributes': [{
			'name': 'defaultSelected',
			'type': 'string',
			'defeaultValue': 'main'
		}],
		'styling': [],

		creationStep: function(element) {
			var drawer = document.createElement('div'),
				main = document.createElement('div');

			drawer.setAttribute('drawer', '');
			main.setAttribute('main', '');

			element.appendChild(main);
			element.appendChild(drawer);

			return element;
		}
	},
	'paper-toolbar': {
		'name': 'Paper Toolbar',
		'import': './bower_components/paper-toolbar/paper-toolbar.html',
		'attributes': [{
			'name': 'bottomJustify',
			'type': 'select',
			'defeaultValue': '',
			'values': ['start', 'center', 'end', 'justified', 'around']
		}, {
			'name': 'justify',
			'type': 'select',
			'defeaultValue': '',
			'values': ['start', 'center', 'end', 'justified', 'around']
		}, {
			'name': 'middleJustify',
			'type': 'select',
			'defeaultValue': '',
			'values': ['start', 'center', 'end', 'justified', 'around']
		}, ],
		'styling': [{
				'name': 'color',
				'type': 'color'

			}, {
				'name': 'background',
				'type': 'color'
			}

		],
		creationStep: functUtils.fillwithName,
		/*
		creationStep: function (element) {
		      var iconButton = ALLWIDGETS.polymer['paper-icon-button'];
		      window.importedLinks.addPolymerWidget(iconButton);

		      var menuAction = document.createElement('paper-icon-button'),
		            span = document.createElement('span');
		      title = document.createElement('div'),
		      refresh = document.createElement('paper-icon-button');
		      search = document.createElement('paper-icon-button');

		      title.innerText = 'Title';

		      menuAction.setAttribute('icon', 'menu');
		      menuAction.setAttribute('role', 'button');
		      menuAction.setAttribute('paper-drawer-toggle', '');// toggle drawer

		      span.classList.add('flex');

		      refresh.setAttribute('icon', 'refresh');

		      search.setAttribute('icon', 'search');

		      element.appendChild(menuAction);
		      element.appendChild(span);
		      element.appendChild(refresh);
		      element.appendChild(search);
		      element.appendChild(title);

		      return element;
		}
		*/
	},
	'paper-icon-button': {
		'name': 'Paper Icon Button',
		'import': './bower_components/paper-icon-button/paper-icon-button.html',
		'attributes': [{
			'name': 'alt',
			'type': 'string',
			'defeaultValue': ''
		}, {
			'name': 'icon',
			'type': 'string', //TODO ...or select
			//TODO insert import iconset automatically
			'defeaultValue': 'home'
		}, {
			'name': 'src',
			'type': 'string',
			'defeaultValue': ''
		}],
		'styling': [{
			'name': 'color',
			'type': 'color'

		}, {
			'name': 'background',
			'type': 'color'
		}],

	},
	'paper-header-panel': {
		'name': 'Paper Header Panel',
		'import': './bower_components/paper-header-panel/paper-header-panel.html',
		'attributes': [{
			'name': 'atTop',
			'type': 'boolean',
			'defeaultValue': true
		}, {
			'name': 'mode',
			'type': 'select',
			'defeaultValue': 'standard',
			'values': ['standard', 'seamed', 'waterfall', 'waterfall-tall', 'scroll', 'cover']
		}, {
			'name': 'shadow',
			'type': 'boolean',
			'defeaultValue': false
		}, {
			'name': 'tallClass',
			'type': 'string',
			'defeaultValue': 'tall'
		}, ],
		'styling': [],
		creationStep: function(element) {

			var paperToolbar = window.components.renderComponent('paper-toolbar', 'Header');
			var div = window.components.renderComponent('div', 'Content');

			element.appendChild(paperToolbar);
			element.appendChild(div);

			return element;
		}
	},
	'iron-icon': {
		'name': "Iron Icon",
		'import': './bower_components/iron-icon/iron-icon.html',
		'attributes': [{
			'name': 'icon',
			'type': 'string', //TODO see if its better to change it to select
			'defeaultValue': 'home'
		}],
		'styling': [{
			'name': 'color',
			'type': 'color'

		}, {
			'name': 'background',
			'type': 'color'
		}]
	},
	'paper-button': {
		'name': "Paper Button",
		'import': './bower_components/paper-button/paper-button.html',
		'attributes': [{
			'name': 'raised',
			'type': 'boolean',
			'defeaultValue': false
		}],
		'styling': [{
			'name': 'color',
			'type': 'color'

		}, {
			'name': 'background',
			'type': 'color'
		}],
		creationStep: functUtils.fillwithName
	},
	'paper-menu': {
		'name': 'Paper Menu',
		'import': './bower_components/paper-menu/paper-menu.html',
		'attributes': [{
			'name': 'multi',
			'type': 'boolean',
			'defeaultValue': false
		}, {
			'name': 'defaultSelected',
			'type': 'string',
			'defeaultValue': 'main'
		}],
		'styling': [],

		creationStep: function(element) {
			var item1 = window.components.renderComponent('a', 'Item 1');
			var item2 = window.components.renderComponent('a', 'Item 2');

			element.appendChild(item1);
			element.appendChild(item2);

			return element;
		}

	}
};
