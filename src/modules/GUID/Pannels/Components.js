import {
	HtmlComponent,
	PolymerComponent
}
from '../Component';

class Components {
	constructor(args) {
		this.documentEditor = args.documentEditor || IDE.GUID.documentEditor;
		let {
			containerId
		} = args;

		this.container = document.createElement('ul');
		document.getElementById(containerId).appendChild(this.container);

		let _this = this;

		this.documentEditor.documentPromise.then((iframeDoc) => {
			_this.htmlComponents = new HtmlComponent({
				document: iframeDoc
			});

			_this.render();
		});
	}

	render() {
		let _this = this;
		let createInsert = function(compoName) {
			return function() {
				let element = _this.htmlComponents.renderComponent(compoName /*, compoName*/ );
				_this.documentEditor.appendToSelectedElement(element);
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
