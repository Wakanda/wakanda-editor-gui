import functUtils from '../functUtils';
import Component from './Component';
import htmlComponent from './components/html';

class HtmlComponent extends Component{
	constructor(args){
		super(args);
		this.components = htmlComponent;
	}

	get componentType(){
		return 'html';
	}

	renderComponent(componentName, fillWith) {
			let htmlComponent = this.components[componentName];

			let node = this.documentEditor.document.createElement(componentName);

			htmlComponent.attributes.forEach(function(attr) {
				if (attr['defeaultValue'] !== undefined) {
					node.setAttribute(attr['name'], attr['defeaultValue']);
				}
			});

			node = (htmlComponent.creationStep || functUtils.identity)(node, fillWith);

			return node;
	}

}

export default HtmlComponent;
