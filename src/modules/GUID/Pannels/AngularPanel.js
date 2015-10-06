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


class AngularInfoExtractor {
	constructor({ script }) {
		this.script = script;
	}

	// NOTE: Experimental
	extractInfos() {
		return this.script
			.codePromise
			.then((code) => {
				let allCode = `
				${this.theMagicAngular}
				(function(angular){
					${code}
					return infos;
				})(magicAngular);
			`;

				let infos = eval(allCode);

				return {
					extractorInstance: this,
					infos
				};
			});

	}

	get theMagicAngular() {
		return `
    var magicAngular = {};
    var infos = {
      applications: []
    };

    var createControllerFunction = function(application) {
      return function(controllerName, controllerContent) {
        application.controllers = application.controllers || [];
        var controller = {
          controllerName: controllerName,
					controllerContent: controllerContent
					  //injections ...
        }
        application.controllers.push(controller);
        return application;
      };
    }

    magicAngular.module = function(appName, dependencies) {
      var newApp = {
        applicationName: appName
      };

      var index = infos.applications.map(function(application) {
        return application.applicationName;
      }).indexOf(appName);

      var application = infos.applications[index] || newApp;

      if (index == -1) {
        infos.applications.push(application);
      }

      var controllerFunction = createControllerFunction(application);
      application.controller = controllerFunction;
      if (dependencies) {
        application.dependencies = dependencies;
      }

      return application;
    };
		`;
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
		// extract informations from script

		this.applicationToScriptMap = new Map();
		this.applicationControllerToScriptMap = new Map();

		this.finalSctiptsPromise = this.getInfosFromScripts().then((infos) => {
			let allApplications = new Set(); // contain names of applications
			let allControllers = [];
			// {
			// 	applicationName
			// 	controllerName,
			// 	controllerfunction
			// }

			infos.forEach((info) => {
				let applications = info.applications;
				applications.forEach((application) => {
					let applicationName = application.applicationName;
					allApplications.add(applicationName);
					let controllers = application.controllers;
					controllers.forEach((controller) => {
						let controllerToAdd = {};

						controllerToAdd.applicationName = applicationName;
						controllerToAdd.controllerName = controller.controllerName;
						controllerToAdd.controllerFunction = controller.controllerContent;

						allControllers.push(controllerToAdd);
					});
				});
			});

			//CreateApplications declaration
			let applicationsScripts = Array.from(allApplications).map((applicationName) => {
				let codeContent = `
// ${applicationName} declaration
angular.module('${applicationName}', []); // no dependecies
				`;

				let applicationScript = this.documentEditor.scriptManager.createEmbdedScript({
					content: codeContent
				});
				this.applicationToScriptMap.set(applicationName, applicationScript);

				return applicationScript;
			});

			let controllersScripts = allControllers.map((controller) => {
				// {
				// 	applicationName
				// 	controllerName,
				// 	controllerfunction
				// }
				let controllerContent;
				if (typeof controller.controllerFunction === 'function') {
					controllerContent = controller.controllerFunction.toString();
				} else {
					let theFunc = controller.controllerFunction.pop();
					let dependecies = controller.controllerFunction;
					let dependenciesStr = dependecies.map((dep) => "'" + dep + "'").join(', ');
					controllerContent = `[${dependenciesStr}, ${theFunc.toString()}]`;
				}
				let codeContent = `
(function(){
	var app = angular.module('${controller.applicationName}');

	app.controller('${controller.controllerName}', ${controllerContent});
})();
				`;

				let controllerScript = this.documentEditor.scriptManager.createEmbdedScript({
					content: codeContent
				});
				this.applicationControllerToScriptMap.set(`${controller.applicationName}.${controller.controllerName}`, controllerScript);
				return controllerScript;
			})

			return {
				applicationsScripts, controllersScripts
			};
		});

		this.finalSctiptsPromise.then(( /*{applicationsScripts, controllersScripts}*/ ) => {

			this.SubscribeToDocumentEditorEvents();
		});

	}


	getInfosFromScripts() {
		let scriptManager = this.documentEditor.scriptManager;
		let scripts = scriptManager.scripts;

		let extractorsPromise = scripts
			.map((script) => {
				let magicExtractor = new AngularInfoExtractor({
					script
				});
				return magicExtractor.extractInfos();
			});

		return Promise.all(extractorsPromise)
			.then((extraIns) => {
				return extraIns.map(({
					extractorInstance, infos
				}) => {
					let script = extractorInstance.script;

					// NOTE: remove scripts
					script.removeFromDocument();

					// console.log(script.htmlTag);
					infos.applications.forEach((application) => {
						// console.log('Application: ' + application.applicationName);
						application.controllers.forEach((controller) => {
							// console.log('Controller: ' + controller.controllerName);
						});
					});

					return infos;
				});
			});

	}

	SubscribeToDocumentEditorEvents() {
		this.documentEditor.onElementSelected(({
			element
		}) => {
			this.renderApplicationName({
				element
			});
			this.renderControllers({
				element
			});
			this.renderAttributes({
				element
			});
		});
	}

	renderAttributes({
		element
	}) {
		let isNg = function(att) {
			let ngAtt = att.name.indexOf('ng-') === 0;
			ngAtt = ngAtt && (att.name.toLowerCase() !== 'ng-app');
			ngAtt = ngAtt && (att.name.toLowerCase() !== 'ng-controller');
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

	renderApplicationName({
			element
		}) {
			let attribute = 'ng-app';
			this.applicationNameInput.value = '';
			let {
				parent, value
			} = AngularPanel.findParrentWithAttribute({
				element, attribute
			})
			this.applicationNameInput.value = value;
			this.bindChanges({
				element, input: this.applicationNameInput, attribute
			});

			let _this = this;
			this.applicationNameLabel.onclick = () => {
				helpers.editScript(_this.applicationToScriptMap.get(_this.applicationNameInput.value));
			};
		}
		// TODO:  generators
	renderControllers({
		element
	}) {
		let attribute = 'ng-controller';
		this.angularControllers.innerHTML = '';
		let controllers = AngularPanel.getParentsWithAttribute({
			element, attribute
		});
		controllers.reverse().forEach(({
			parent, value
		}, index, array) => {
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
			label.onclick = () => {
				helpers.editScript(_this.applicationControllerToScriptMap.get(`${_this.applicationNameInput.value}.${input.value}`));
			};
		});

	}

	static findParrentWithAttribute({
		element, attribute
	}) {
		let value,
			tagName,
			elementIterate = element;
		do {
			value = elementIterate.getAttribute(attribute);
			tagName = elementIterate.tagName.toLowerCase();
			elementIterate = elementIterate.parentElement;
		} while (tagName !== 'body' && !value);

		return {
			parent: elementIterate,
			value
		}; //{element, value}
	}

	static getParentsWithAttribute({
		element, attribute
	}) {
		let parents = [];
		let {
			parent, value
		} = AngularPanel.findParrentWithAttribute({
			element, attribute
		});
		while (value) {
			parents.push({
				parent, value
			});
			let o = AngularPanel.findParrentWithAttribute({
				element: parent,
				attribute
			});
			parent = o.parent
			value = o.value;
		}
		return parents;
	}

	bindChanges({
		element, input, attribute
	}) {
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
		this.documentEditor.onElementAttributeChange(({
			element: changedElement,
			attribute,
			value
		}) => {
			if (element === changedElement && attribute.name === attribute) {
				if (input) {
					input.value = value;
				}
			}
		});
	}

}

export default AngularPanel;
