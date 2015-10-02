let helpers = {
	createInputWithLabel({labelContent, content, id, withLi}){
		id = id || (labelContent + '-id');

		let label = document.createElement('label');
		label.setAttribute('for', id);
		label.textContent = labelContent;

		let input	= document.createElement('input');
		input.setAttribute('id', id);
		input.setAttribute('id', 'text');

		if(content){
			input.value = content;
		}

		label.appendChild(input);

		let li;
		if(withLi){
			li = document.createElement('li');
			li.appendChild(label);
		}

		return {label, input, li};
	}
};



class AngularInfoExtractor{
	constructor({code}){
		this.code = code;
	}

	extractInfos(){
		let allCode = `
${this.theMagicString}
(function(angular){
	${this.code}
	return infos;
})(magicAngular);
		`;
		return eval(allCode);
	}

	get theMagicString(){
		return `
var magicAngular = {};
var infos = {};
var anApp = {};

magicAngular.module = function(){
	infos.modules = infos.modules || [];
	infos.modules.push(arguments);
	return anApp;
}

anApp.controller = function(){
	infos.controllers = infos.controllers || [];
	infos.controllers.push(arguments);
};
		`;
	}

}

class AngularPanel {
	constructor({documentEditor, containerId}) {
		this.documentEditor = documentEditor || IDE.GUID.documentEditor;
		this.panelContainer = document.getElementById(containerId);

		let {label, input} = helpers.createInputWithLabel({
			id: 'application-name',
			labelContent: 'Angular Application Name'
		});

		this.panelContainer.appendChild(label);

		this.applicationNameInput = input;

		this.angularAttributes = document.createElement('ul');
		this.angularControllers = document.createElement('ul');

		this.panelContainer.appendChild(this.angularControllers);
		this.panelContainer.appendChild(this.angularAttributes);
		// extract informations from script
		this.magicMapPromise = this.getInfosFromScripts();

		this.SubscribeToDocumentEditorEvents();
	}

	getInfosFromScripts(){
		let scriptManager = this.documentEditor.scriptManager;
		let scripts = scriptManager.scripts;

		let promiseCodeArray = scripts.map((script) => {
			return script.codePromise.then((code) => {
				return {code, script};
			});
		});
		return Promise.all(promiseCodeArray).then((codeArray) => {
			let magicMap = new Map();

			codeArray.forEach(({code, script})=>{
				// TODO: rewrite it !
				let extractor = new AngularInfoExtractor({code});
				let angularInformations = extractor.extractInfos();

				let controllers = angularInformations.controllers;
				controllers.forEach((controller)=>{
					console.log({
						controllerName: controller[0],
						scriptSrc: script.src
					});
				});
			});
		});
	}

	SubscribeToDocumentEditorEvents(){
		this.documentEditor.onElementSelected(({element}) => {
			this.renderApplicationName({element});
			this.renderControllers({element});
			this.renderAttributes({element});
		});
	}

	renderAttributes({element}){
		let isNg = function(att){
			let ngAtt = att.name.indexOf('ng-') === 0;
			ngAtt = ngAtt && (att.name.toLowerCase() !== 'ng-app');
			ngAtt = ngAtt && (att.name.toLowerCase() !== 'ng-controller');
			return ngAtt;
		};
		this.angularAttributes.innerHTML = '';

		Array.from(element.attributes)
			.filter(isNg)
			.forEach((ngAttribute)=>{
				let {label, input, li} = helpers.createInputWithLabel({
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

	renderApplicationName({element}){
		let attribute = 'ng-app';
		this.applicationNameInput.value = '';
		let {parent, value} = AngularPanel.findParrentWithAttribute({element, attribute})
		this.applicationNameInput.value = value;
		this.bindChanges({element, input: this.applicationNameInput, attribute});
	}
	// TODO:  generators
	renderControllers({element}){
		let attribute = 'ng-controller';
		this.angularControllers.innerHTML = '';
		let controllers = AngularPanel.getParentsWithAttribute({element, attribute});
		controllers.forEach(({parent, value}, index, array) => {
			let {input, label, li} = helpers.createInputWithLabel({
				labelContent: 'controller' + (array.length > 1 ? ( ' ' + ( index + 1 ) ) : '' ),
				content: value,
				withLi: true
			});
			this.angularControllers.appendChild(li);
			this.bindChanges({
				element: parent,
				input,
				attribute
			});
		});
	}

	static findParrentWithAttribute({element, attribute}){
		let value,
				tagName,
				elementIterate = element;
		do{
			value = elementIterate.getAttribute(attribute);
			tagName = elementIterate.tagName.toLowerCase();
			elementIterate = elementIterate.parentElement;
		}while(tagName !== 'body' && ! value);

		return {parent: elementIterate, value}; //{element, value}
	}

	static getParentsWithAttribute({element, attribute}){
		let parents = [];
		let {parent, value} = AngularPanel.findParrentWithAttribute({element, attribute});
		while (value) {
			parents.push({parent, value});
			let o = AngularPanel.findParrentWithAttribute({element: parent, attribute});
			parent = o.parent
			value = o.value;
		}
		return parents;
	}

	bindChanges({element, input, attribute}){
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
		this.documentEditor.onElementAttributeChange(({element: changedElement, attribute, value})=>{
			if(element === changedElement && attribute.name === attribute){
				if(input){
					input.value = value;
				}
			}
		});
	}

	// TODO: remove it
	// static renderLiOfAttribute({element, attribute}){
	// 	let li = document.createElement('li');
	//
	// 	let {label, input} = helpers.createInputWithLabel({
	// 		labelContent: attribute.name,
	// 		content: attribute.value
	// 	});
	// 	li.appendChild(label);
	//
	// 	return li;
	// }

	// renderArrayOfControllers({element}){
	// 	let controllers = [];
	//
	// 	let controllers = AngularPanel.getControllersFromElement({element});
	// 	controllers.forEach(({element:el, controllersName: ctrlName}, index, array)=>{
	// 		let li = document.createElement('li');
	//
	// 		let {label, input} = helpers.createInputWithLabel({
	// 			labelContent: 'Controller ' + index,
	// 			content: ctrlName
	// 		});
	// 		li.appendChild(label);
	//
	// 		this.bindChanges({element:el, input, attribute: 'ng-controller'});
	//
	// 		controllers.push(li);
	// 	});
	//
	// 	return controllers;
	// }

  // SubscribeToDocumentEditorEvents_old(){
  //   this.documentEditor.onElementSelected(({element}) => {
	//
	// 		this.angularAttributes.innerHTML = '';
	//
	// 		for (let i = 0; i < element.attributes.length; i++) {
	//
	// 		  let attrib = element.attributes[i];
	//
	// 			if(attrib.name.indexOf('ng-') === 0){
	// 				// attributes
	// 				let li = AngularPanel.renderLiOfAttribute({element, attribute: attrib});
	//
	// 				this.bindChanges({element, li, attribute: attrib});
	//
	// 				this.angularAttributes.appendChild(li);
	//
	// 				// controllers
	//
	//
	// 			}
	// 		}
	//
	// 	});
  // }

	// static getAppnameFromElement({element}){
	// 		let ngApp, tagName,
	// 				elementIterate = element;
	// 		do{
	// 			ngApp = elementIterate.getAttribute('ng-app');
	// 			tagName = elementIterate.tagName.toLowerCase();
	// 			elementIterate = elementIterate.parentElement;
	// 		}while(tagName !== 'body' && ! ngApp);
	//
	// 		return ngApp;
	// }

	// static getControllersFromElement({element}){
	// 	let controllers = [],
	// 			tagName,
	// 			elementIterate = element;
	//
	// 	do{
	// 		 let ctrl = elementIterate.getAttribute('ng-controller');
	// 		 if(ctrl){
	// 			 controllersNames.push({
	// 				 element: elementIterate,
	// 				 controllersName: ctrl
	// 			 });
	// 		 }
	// 		 tagName = elementIterate.tagName.toLowerCase();
	// 		 elementIterate = elementIterate.parentElement;
	// 	}while(tagName !== 'body');
	//
	// 	return controllers;// {element, controllersName}
	// }

}

export default AngularPanel;
