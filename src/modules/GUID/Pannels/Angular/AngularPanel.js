import AngularInfoExtractor from './AngularInfoExtractor';

let helpers = {
	createCheckBox({text}){
		// http://stackoverflow.com/questions/866239/creating-the-checkbox-dynamically-using-javascript
		let li = document.createElement('li');
		var checkbox = document.createElement('input');
		checkbox.type = "checkbox";
		var label = document.createElement('label')
		label.htmlFor = "id";
		label.appendChild(document.createTextNode(text));

		li.appendChild(checkbox);
		li.appendChild(label);

		return li;
	},
	editScript(script) {
			let scriptEditorDiv = document.createElement('div');
			let editor = ace.edit(scriptEditorDiv);
			editor.setTheme("ace/theme/monokai");
			editor.getSession().setMode("ace/mode/javascript");
			editor.setValue(script.htmlTag.innerText);
			editor.setOptions({
				maxLines: Infinity
			});
			editor.session.setNewLineMode("windows");

			let _this = this;

			bootbox.dialog({
				message: scriptEditorDiv,
				title: "Edit Script",
				buttons: {
					success: {
						label: "Save changes",
						className: "btn-success",
						callback: () => {
							let content = editor.getSession().getValue();
							script.htmlTag.innerHTML = content;
						}
					}
				}
			});

		},
		createInputWithLabel({ labelContent, content, id, withLi }) {
			id = id || (labelContent + '-id');

			let label = document.createElement('label');
			label.setAttribute('for', id);
			label.textContent = labelContent;

			let input = document.createElement('input');
			input.setAttribute('id', id);
			input.setAttribute('id', 'text');

			if (content) {
				input.value = content;
			}

			label.appendChild(input);

			let li;
			if (withLi) {
				li = document.createElement('li');
				li.appendChild(label);
			}

			return {
				label, input, li
			};
		}
};

class AngularPanel {
	constructor({ documentEditor, containerId }) {
		this.documentEditor = documentEditor || IDE.GUID.documentEditor;
		this.panelContainer = document.getElementById(containerId);

		let { label, input } = helpers.createInputWithLabel({
			id: 'application-name',
			labelContent: 'Angular Application Name'
		});

		this.panelContainer.appendChild(label);

		this.applicationNameInput = input;
		this.applicationNameLabel = label;

		this.angularAttributes = document.createElement('ul');
		this.angularControllers = document.createElement('ul');

		this.panelContainer.appendChild(this.angularControllers);
		this.panelContainer.appendChild(this.angularAttributes);

		this.SubscribeToDocumentEditorEvents();

		// show scripts
		this.initAngularExtractor({scripts: this.documentEditor.scripts});
		this.renderScripts();

	}

	renderScripts(){
		let scripts = this.documentEditor.scripts;
		let ul = document.createElement('ul');
		this.panelContainer.appendChild(ul);
		this.scripts.forEach((script)=>{
			let liCheckBox = helpers.createCheckBox({text: script.text});
			ul.appendChild(liCheckBox);
		});
		let buttonEstract = document.createElement('button');
		buttonEstract.innerText = 'Reorganise Angular Scripts';
		this.panelContainer.appendChild(buttonEstract);
	}

	initAngularExtractor({scripts}) {
		this.scripts = scripts;
		this.angularInfoExtractor = new AngularInfoExtractor({scripts: this.scripts});
		this.angularInfoExtractor.applicationsPromise.then((applications)=>{
			console.log(applications);
		});
	}

	SubscribeToDocumentEditorEvents() {
		this.documentEditor.onElementSelected(({ element }) => {
			this.renderApplicationName({ element });
			this.renderControllers({ element });
			this.renderAttributes({	element	});
		});
		this.documentEditor.onScriptChange(({scripts})=>{
			this.initAngularExtractor({scripts});
			this.renderScripts();
		});
	}

	renderAttributes({ element }) {

		let isNg = function(att) {
			let ngAtt = att.name.indexOf('ng-') === 0
			 						&& (att.name.toLowerCase() !== 'ng-app')
			 						&& (att.name.toLowerCase() !== 'ng-controller');
			return ngAtt;
		};
		this.angularAttributes.innerHTML = '';

		Array.from(element.attributes)
			.filter(isNg)
			.forEach((ngAttribute) => {
				let {
					label, input, li
				} = helpers.createInputWithLabel({
					labelContent: ngAttribute.name,
					content: ngAttribute.value,
					withLi: true
				});
				this.angularAttributes.appendChild(li);
				this.bindChanges({
					element: element,
					input,
					attribute: ngAttribute.name
				});
			});
	}

	renderApplicationName({ element }) {

			let attribute = 'ng-app';
			this.applicationNameInput.value = '';

			let { parent, value	} = AngularPanel.findParrentWithAttribute({ element, attribute });

			this.applicationNameInput.value = value;
			this.bindChanges({
				element, input: this.applicationNameInput, attribute
			});

			let _this = this;
			this.applicationNameLabel.ondblclick = () => {
				helpers.editScript(_this.applicationToScriptMap.get(_this.applicationNameInput.value));
			};
		}
		// TODO:  generators
	renderControllers({ element }) {

		let attribute = 'ng-controller';
		this.angularControllers.innerHTML = '';
		let controllers = AngularPanel.getParentsWithAttribute({ element, attribute });

		controllers.reverse().forEach(({ parent, value }, index, array) => {

			let {
				input, label, li
			} = helpers.createInputWithLabel({
				labelContent: 'controller' + (array.length > 1 ? (' ' + (index + 1)) : ''),
				content: value,
				withLi: true
			});
			this.angularControllers.appendChild(li);
			this.bindChanges({
				element: parent,
				input,
				attribute
			});

			let _this = this;
			label.ondblclick = () => {
				helpers.editScript(_this.applicationControllerToScriptMap.get(`${_this.applicationNameInput.value}.${input.value}`));
			};
		});

	}

	// TODO: usegen
	static findParrentWithAttribute({ element, attribute }) {


		let value,
				tagName,
				elementIterate = element;

		while (elementIterate && !value) {

			value = elementIterate.getAttribute(attribute);

			elementIterate = elementIterate.parentElement;
		};


		return {
			parent: value ? elementIterate : null,
			value
		}; //{element, value}
	}

	static getParentsWithAttribute({ element, attribute }) {


		let parents = [];


		let { parent, value } = AngularPanel.findParrentWithAttribute({ element, attribute });


		while (value && parent) {
			parents.push({ parent, value });


			let o = AngularPanel.findParrentWithAttribute({
				element: parent,
				attribute
			});
			parent = o.parent
			value = o.value;
		}
		return parents;
	}


	bindChanges({ element, input, attribute}) {

		let _this = this;
		input.addEventListener('change', () => {
			console.log(this, arguments);
			let newVal = input.value;
			_this.documentEditor.changeElementAttribute({
				element,
				attribute,
				value: newVal
			});
		});

		// element attribute change
		this.documentEditor.onElementAttributeChange(({ element: changedElement, attribute, value}) => {
			if (element === changedElement && attribute.name === attribute) {
				if (input) {
					input.value = value;
				}
			}
		});
	}

}

export default AngularPanel;
