import {HttpClient} from "../../../../lib/aurelia-http-client";

const PORT = 9090;

let helpers = {
  saveFileForPreview({path, content}){
    // FIXME: temporary saving mechanism
    let postFile = ({requestType, pathToFile, fileContent}) => { //'save'/'preview'
  		let client = new HttpClient().configure(x => {
  	    x.withHeader('Content-Type', 'application/json');
  	  });
  		return client.post(`http://localhost:${PORT}/sevePreview`, {fileName: pathToFile, fileContent, requestType})
  			.then(({response})=>{
          console.log('file saved', response);
  				return response;
  			});
  	};
    return postFile({requestType: 'preview', pathToFile : path, fileContent: content});
  },
  getFile({url}){
  	let client = new HttpClient().configure(x => {
      // x.withHeader('Content-Type', 'application/json');
    });
  	return client.get(url)
  		.then(({response})=>{
  			return response;
  		});
  },
  // NOTE: temporary
  getConfigRoutesCode({routes, otherwise, applicationName}){
    let codeRoutes = '';
    routes.forEach((route, path)=>{
      let routeCode = `
        .when('${path}', ${JSON.stringify(route)})
      `;
      codeRoutes += routeCode;
    });
    codeRoutes += `
        .otherwise(${JSON.stringify(otherwise)});
    `;
    let code = `
    (function(app){
      app.config(['$routeProvider',function($routeProvider){
        $routeProvider
          ${codeRoutes}
      }]);
    })(angular.module('${applicationName}'));
    `;
    return code;
  },

  // NOTE: I do not write this function so, it must be rewritten (its probabely buggy)
  //  from http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
  getFunctionParamsAsStringArray({func}){
    return func.toString()
    .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,'')
    .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
    .split(/,/);
  },
  getDeclarationCodeOfApplication({applicationInfos: application}){
    let applicationName = application.applicationName;
    let dependenciesAsString = application.dependencies
      .map((s)=>`'${s}'`)
      .join(', ');
    let code = `
      (function(angular){
        angular.module('${applicationName}', [${dependenciesAsString}]);
      })(angular);
    `;
    return code;
  },
	isOk(o){
    return !!o;
  },
  stringToDomElements({documentParent = document, content}){
    let span = documentParent.createElement('span');
    span.innerHTML = content;
    return span.children;
  },
  domElementsToString({documentParent = document, elements}){
    let span = documentParent.createElement('span');
    [...elements].forEach((element)=>{
      span.appendChild(element.cloneNode(true));
    });
    return span.innerHTML;
  },
  domArrayToDocumentFragment({domArray}){
    let docFrag = document.createDocumentFragment();
    domArray.forEach((item)=>{
      docFrag.appendChild(item);
    });
    return docFrag;
  },
  docFragmentToString({documentFragment}){
    let span = document.createElement('span');
    span.appendChild(documentFragment);
    return span.innerHTML;
  },
  domElementToString({documentParent = document, element}){
    let span = documentParent.createElement('span');
    span.appendChild(element);
    return span.innerHTML;
  },
  parentalTest({parent, child}){
    // need optimisation (and name also)
    let elementIterate = child;
    while(elementIterate !== parent && elementIterate !== null){
      elementIterate = elementIterate.parentElement;
    }
    return elementIterate !== null;
  },
  extractInfos({script}) {
		return script
			.codePromise
			.then((code) => {
				let allCode = `
				${this.magicAngular}
				var myFunction = function(angular){
					${code}
					return infos;
				};
				let thisArg = {};
				myFunction.call(thisArg, magicAngular);\n`
				;

				let applications = eval(allCode);
				return applications;
			});
	},
	createRadioButton({groupName, value, text, onChange, onClickSave}) {
		// http://stackoverflow.com/questions/23430455/in-html-with-javascript-create-new-radio-button-and-its-text
		let label = document.createElement("label");
		let radioInput = document.createElement("input");
		radioInput.type = "radio";
		radioInput.name = groupName;
		radioInput.value = value;
		let saveButton = document.createElement('button');

		saveButton.onclick = function(){
			let li = this.parentElement;
			let radioInput = li.querySelector("input[type='radio']");
			onClickSave({value: radioInput.value})
		};
		saveButton.innerText = 'Save Template';
		radioInput.onclick = function(){
			onChange({value: this.value});
		};

		label.appendChild(radioInput);

		label.appendChild(document.createTextNode(text));
		let li = document.createElement('li');
		li.appendChild(label);
		li.appendChild(saveButton);
		return li;
	},
	findParrentWithAttribute({ element, attribute }) {
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
	},
	getParentsWithAttribute({ element: elementArg, attribute }) {
		let elements = [];
		let {element,  parent, value } = this.findParrentWithAttribute({ element: elementArg, attribute });
		while (value && parent) {
			elements.push({ element, value });
			let o = this.findParrentWithAttribute({
				element: parent,
				attribute
			});
			parent = o.parent;
			element = o.element;
			value = o.value;
		}
		return elements.map(({element, value})=>{
			return {element, controllerName:value};
		});
	},
	createTitle({text, h = 'h3'}){
		let title = document.createElement(h);
		title.innerText = text;
		return title;
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
	},
  magicAngular : `
  		var magicAngular = {};
  		var infos = {
  			applications: []
  		};
  		var RecipeFunctions = {};
  		var createControllerFunction = function(application) {
  			return function(controllerName, controllerContent) {
  				application.recipes.controller = application.recipes.controller || [];
  				var controller = {
  					controllerName: controllerName,
  					controllerContent: controllerContent
  						//injections ...
  				};
  				application.recipes.controller.push(controller);
  				return application;
  			};
  		};

  		var createValueFunction = function(application) {
  			return function(key, value) {
  				application.recipes.value = application.recipes.value || [];
  				var keyVal = {
  					key: key,
  					value: value
  				};
  				application.recipes.value.push(keyVal);
  				return application;
  			};
  		};
  		var createFactoryFunction = function(application) {
  			return function(factoryName, factoryContent) {
  				application.recipes.factory = application.recipes.factory || [];
  				var factory = {
  					factoryName: factoryName,
  					factoryContent: factoryContent
  				};
  				application.recipes.factory.push(factory);
  				return application;
  			};
  		};
  		var createServiceFunction = function(application) {
  			return function(serviceName, serviceContent) {
  				application.recipes.service = application.recipes.service || [];
  				var service = {
  					serviceName: serviceName,
  					serviceContent: serviceContent
  				};
  				application.recipes.service.push(service);
  				return application;
  			};
  		};
  		var createProviderFunction = function(application) {
  			return function(providerName, providerContent) {
  				application.recipes.provider = application.recipes.provider || [];
  				var provider = {
  					providerName: providerName,
  					providerContent: providerContent
  				};
  				application.recipes.provider.push(provider);
  				return application;
  			};
  		};
  		var createDirectiveFunction = function(application) {
  			return function(directiveName, directiveContent) {
  				application.recipes.directive = application.recipes.directive || [];
  				var directive = {
  					directiveName: directiveName,
  					directiveContent: directiveContent
  				};
  				application.recipes.directive.push(directive);
  				return application;
  			};
  		};
  		var createFilterFunction = function(application) {
  			return function(directiveName, directiveContent) {
  				application.recipes.filter = application.recipes.filter || [];
  				var filter = {
  					filterName: filterName,
  					filterContent: filterContent
  				};
  				application.recipes.filter.push(filter);
  				return application;
  			};
  		};
  		var createConstantFunction = function(application) {
  			return function(constantName, constantContent) {
  				application.recipes.constant = application.recipes.constant || [];
  				var constant = {
  					constantName: constantName,
  					constantContent: constantContent
  				};
  				application.recipes.constant.push(constant);
  				return application;
  			};
  		};
  		var createConfigFunction = function(application) {
  			return function(configContent) {// configs do not have names
  				application.recipes.config = application.recipes.config || [];
  				var config = {
  					// configName: configName,
  					configContent: configContent
  				};
  				application.recipes.config.push(config);
  				return application;
  			};
  		};

  		magicAngular.module = function(appName, dependencies) {
  			var newApp = {
  				applicationName: appName,
  		    recipes: {}
  			};

  			var index = infos.applications.map(function(application) {
  				return application.applicationName;
  			}).indexOf(appName);

  			var application = infos.applications[index] || newApp;

  			if (index == -1) {
  				infos.applications.push(application);
  			}

  			application.controller = createControllerFunction(application);
  			application.factory = createFactoryFunction(application);
  			application.service = createServiceFunction(application);
  			application.provider = createProviderFunction(application);
  			application.directive = createDirectiveFunction(application);
  			application.filter = createFilterFunction(application);
  			application.constant = createConstantFunction(application);
  		  application.config = createConfigFunction(application);

  			if (dependencies) {
  				application.dependencies = dependencies;
  				application.declaration = true;
  			}

  			return application;
  		};
  `,
  recipeTypes: {
    recipes: {
      controller:'controller',
      factory:'factory',
      service:'service',
      provider:'provider',
      directive:'directive',
      filter:'filter',
      constant:'constant',
      config:'config'
    },
    plurals: {
      controller:'controllers',
      factory:'factorie',
      service:'services',
      provider:'providers',
      directive:'directives',
      filter:'filters',
      constant:'constants',
      config:'configs'
    },
    getAsArray(){
      return Object.keys(this.recipes).map((recipT)=>{
        return this.recipes[recipT];
      });
    }
  }
};


export default helpers;
