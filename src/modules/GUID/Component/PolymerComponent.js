import functUtils from '../functUtils';
import Component from './Component';
import polymerComponent from './components/polymer';

class PolymerComponent extends Component {
	constructor(args) {
		super(args);
		this.components = polymerComponent;

	}

	get componentType() {
		return 'polymer';
	}

	renderComponent(componentName, fillWith) {
		var polymerWidget = this.components[componentName];

		let importHref = polymerWidget['import'];

		this.documentEditor.addImportTag(importHref);
		// this.documentEditor.addImportTag().importedLinks.addPolymerWidget(polymerWidget);
		//TODO : remove rel when widget is deleted

		var node = this.documentEditor.document.createElement(componentName);

		polymerWidget.attributes.forEach(function(attr) {
			if (attr['defeaultValue'] !== undefined) {
				node[attr['name']] = attr['defeaultValue'];
				//node.setAttribute(attr['name'], attr['defeaultValue']);
			}
		});

		node = (htmlComponent.creationStep || functUtils.identity)(node, fillWith);

		return node;
	}

}

export default PolymerComponent;
