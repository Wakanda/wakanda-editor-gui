
class Component {
	constructor({documentEditor = IDE.GUID.documentEditor}) {
		this.documentEditor = documentEditor;
		this.components  = [];
	}

	exists(tagName) {
		return this.Components[tagName] !== undefined;
	}

	getComponent(componentName) {
		return this.components[componentName];
	}

	hasAttribute(tagName, attName) {
		var component = this.components[tagName] || {
			'attributes': []
		}

		var attributesName = (component.attributes || []).map(functUtils.mapNameOfObject);

		return (-1 !== attributesName.indexOf(attName));
	}


	getComponentsNames(){
		return Object.keys(this.components);
	}

}

export default Component;

