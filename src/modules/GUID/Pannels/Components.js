import { 	HtmlComponent, PolymerComponent } from '../Component';

class Components {
	constructor({documentEditor, containerId}) {
		this.documentEditor = documentEditor || IDE.GUID.documentEditor;
		this.events = this.documentEditor.events;

		this.container = document.getElementById(containerId);

		this.htmlComponents = new HtmlComponent({
			document: this.documentEditor.document
		});

		this.render();
	}

	render() {
		// let createInsert = (compoName) => {
		// 	return () => {
		// 		let element = this.htmlComponents.renderComponent(compoName);
		// 		this.documentEditor.appendElement({element});
		// 	};
		// };

		let compoNames = this.htmlComponents.getComponentsNames();
		for (let compoName of compoNames) {
			let div = document.createElement('div');
			div.innerHTML = compoName;
			div.renderComponent = () => {
				return this.htmlComponents.renderComponent(compoName);
			};
			// div.addEventListener('click', createInsert(compoName));

			this.container.appendChild(div);
		}
	}

}

export default Components;
