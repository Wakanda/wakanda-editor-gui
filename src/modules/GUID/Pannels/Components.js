import { 	HtmlComponent, PolymerComponent }
from '../Component';

class Components {
	constructor({documentEditor, containerId}) {
		this.documentEditor = documentEditor || IDE.GUID.documentEditor;

		this.container = document.createElement('ul');
		document.getElementById(containerId).appendChild(this.container);

		this.documentEditor.documentPromise.then((iframeDoc) => {
			this.htmlComponents = new HtmlComponent({
				document: iframeDoc
			});

			this.render();
		});
	}

	render() {
		let createInsert = (compoName) => {
			return () => {
				let element = this.htmlComponents.renderComponent(compoName /*, compoName*/ );
				this.documentEditor.appendElement({element});
			}
		};

		let compoNames = this.htmlComponents.getComponentsNames();
		for (let compoName of compoNames) {
			let li = document.createElement('li');
			li.textContent = compoName;
			li.addEventListener('click', createInsert(compoName));

			this.container.appendChild(li);
		}
	}

}

export default Components;
