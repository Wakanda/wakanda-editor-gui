import AngularInfoExtractor from './AngularInfoExtractor';

let helpers = {
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

class ScriptsRenderer{
	constructor({container, onExtractClick}){
		this.container = container;

		this.scriptTotag = new WeakMap();
		this.tagToScript = new WeakMap();

		this.ul = document.createElement('ul');
		this.container.appendChild(this.ul);

		let buttonEstract = document.createElement('button');
		buttonEstract.innerText = 'Reorganise Angular Scripts';
		this.onExtractClick = onExtractClick;
		let _this = this;
		buttonEstract.onclick = ()=>{
			if(_this.onExtractClick){
				_this.onExtractClick({scripts: _this.getSelectedScripts()});
			}
		};
		this.container.appendChild(buttonEstract);

	}

	getSelectedScripts(){
		return Array.from(this.ul.querySelectorAll('input'))
			.filter((input)=>{
				return input.checked;
			}).map((input)=>{
				return this.tagToScript.get(input);
			});
	}

	render({scripts}){
		this.ul.innerHTML = "";

		scripts.forEach((script)=>{
			let liCheckBox = ScriptsRenderer.createCheckBox({text: script.text});
			let input = liCheckBox.querySelector('input');
			if(script.type === 'embded'){
				let editButton = document.createElement('button');
				editButton.innerText = 'edit';
				editButton.onclick = ()=>{
					helpers.editScript(script);
				};
				liCheckBox.appendChild(editButton);
			}
			this.scriptTotag.set(script, input);
			this.tagToScript.set(input, script);
			this.ul.appendChild(liCheckBox);
		});
	}

	clearHlighting(){
		[... this.ul.childNodes].forEach((li)=>{
			li.classList.remove('highligh');
		});
	}

	highlightScript({script}){
		this.clearHlighting();
		this.scriptTotag.get(script).parentElement.classList.add('highligh');
	}

	static createCheckBox({text}){
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
	}

}

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

		this.subscribeToDocumentEditorEvents();

		this.scriptsRenderer = new ScriptsRenderer({
			container: this.panelContainer,
			onExtractClick: ({scripts})=>{
				this.extractFromScripts({scripts});
		 	}
		});

		this.whenScriptChanges();// first load
	}

	extractFromScripts({scripts}){
		let extractor = new AngularInfoExtractor({scripts});
		extractor.applicationsPromise.then((mainApplications) => {
			// TODO: just the first main application (experimental)
			let mainApp = mainApplications[0];

			let scriptForApplications = [];
			if(mainApp.code){
				scriptForApplications.push(this.documentEditor.scriptManager.createEmbdedScript({
					content: mainApp.code,
					text: 'Application ' + mainApp.name
				}));
			}

			let scriptsForControllers = mainApp.allControllers
				.map((controller)=>{
					return this.documentEditor.scriptManager.createEmbdedScript({
						content: controller.code,
						text : 'Contoller ' + controller.name
					});
				});

			this.documentEditor.addRemoveScripts({
				scriptsToAdd: [... scriptForApplications, ...scriptsForControllers],
				scriptsToRemove: scripts
			});
		});
	}

	whenScriptChanges(){
		this.initAngularExtractor({scripts: this.documentEditor.scripts});
		this.scriptsRenderer.render({scripts: this.documentEditor.scripts});
	}

	initAngularExtractor({scripts}) {
		this.scripts = scripts;
		this.angularInfoExtractor = new AngularInfoExtractor({scripts: this.scripts});
		this.mainApplicationsPromise = this.angularInfoExtractor.applicationsPromise.then((applications)=>{
			return applications;
		});
	}

	subscribeToDocumentEditorEvents() {
		this.documentEditor.onElementSelected(({ element }) => {
			this.renderApplicationName({ element });
			this.renderControllers({ element });
			this.renderAttributes({	element	});
		});
		this.documentEditor.onChangeScript(({script})=>{	//
			this.whenScriptChanges();
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
				let {	label, input, li } = helpers.createInputWithLabel({
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
	}

	// TODO:  generators
	renderControllers({ element }) {
		// TODO: remove this also
		this.scriptsRenderer.clearHlighting();

		let attribute = 'ng-controller';
		this.angularControllers.innerHTML = '';
		let controllers = AngularPanel.getParentsWithAttribute({ element, attribute });

		controllers.reverse().forEach(({ element, value }, index, array) => {
			// TODO: remove this from here
			this.mainApplicationsPromise.then((mainApplicationsArray) => {
				console.log(mainApplicationsArray);
				let application = mainApplicationsArray[0];
				let controller = application.findRecipeByName({name: value});
				let script = controller.script;

				this.scriptsRenderer.highlightScript({script});
			});
			// end todo
			let { input, label, li } = helpers.createInputWithLabel({
				labelContent: 'controller' + (array.length > 1 ? (' ' + (index + 1)) : ''),
				content: value,
				withLi: true
			});
			this.angularControllers.appendChild(li);
			this.bindChanges({
				element,
				input,
				attribute
			});

		});

	}

	// TODO: usegen
	static findParrentWithAttribute({ element, attribute }) {

		let value,
				tagName,
				elementIterate = element,
				lastElement = element;

		while (elementIterate && !value) {

			value = elementIterate.getAttribute(attribute);
			lastElement = elementIterate;
			elementIterate = elementIterate.parentElement;
		};

		return {
			element: value ? lastElement : null,
			parent: value ? elementIterate : null,
			value
		}; //{element, value}
	}

	static getParentsWithAttribute({ element: elementArg, attribute }) {

		let elements = [];

		let {element,  parent, value } = AngularPanel.findParrentWithAttribute({ element: elementArg, attribute });

		while (value && parent) {
			elements.push({ element, value });

			let o = AngularPanel.findParrentWithAttribute({
				element: parent,
				attribute
			});
			parent = o.parent;
			element = o.element;
			value = o.value;
		}
		return elements;
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
