import AngularPage from './AngularPage';
import recipeTypes from './recipeTypes';

let helpers = {
	isOk(o){
		return !!o;
	},
	// NOTE: temporary
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
		}
};

class ScriptsRenderer{
	constructor({container}){
		this.container = container;

    this.container.appendChild(helpers.createTitle({text: 'Scripts :'}));

		this.scriptTotag = new WeakMap();
		this.tagToScript = new WeakMap();

		this.ul = document.createElement('ul');
		this.container.appendChild(this.ul);

	}

	getSelectedScripts(){
		return Array.from(this.ul.querySelectorAll('input'))
			.filter((input)=>{
				return input.checked;
			}).map((input)=>{
				return this.tagToScript.get(input);
			});
	}

  addScript({script}){
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
  }

  removeScript({script}){
    let tag = this.scriptTotag.get(script);
    this.tagToScript.delete(tag);
    this.scriptTotag.delete(script);
    let li = tag.parentElement
    li.parentElement.removeChild(li);
  }

	render({scripts}){
		this.ul.innerHTML = "";

		scripts.forEach((script)=>{
      this.addScript({script});
		});
	}

	clearHlighting({level}){
		[... this.ul.childNodes].forEach((li)=>{
			if(level){
				li.classList.remove('highligh'+level);
			}else{
				li.classList.remove('highligh');
				li.classList.remove('highligh1');
				li.classList.remove('highligh2');
			}
		});
	}

	highlightScripts({scripts, level = ''}){
		this.clearHlighting({level});
		scripts.forEach((script)=>{
			let tag = this.scriptTotag.get(script).parentElement;
			let highlited = tag.classList.contains('highligh');
			if(!level || !highlited){
				tag.classList.add('highligh'+level);
			}
		});
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

class RecipeRenderer{
  constructor({container}){
    this.container = container;

    this.recipeToLi = new WeakMap();
    this.container.appendChild(helpers.createTitle({text: 'Angular Components : '}));

  }
  highlightRecipes({recipes, level = ''}){
    this.clearHlighting({level});
    recipes.forEach((recipe)=>{
      if(this.recipeToLi.has(recipe)){
        this.recipeToLi.get(recipe).classList.add('highligh'+level);
      }else{
        console.warn('try to highlight unexisting component');
      }
    });
  }
  clearHlighting({level}){
		[... this.container.querySelectorAll('li')].forEach((li)=>{
			if(level){
				li.classList.remove('highligh'+level);
			}else{
				li.classList.remove('highligh');
				li.classList.remove('highligh1');
				li.classList.remove('highligh2');
			}
		});
	}
  getRecipeLi({recipe}){
    if(! this.recipeToLi.has(recipe)){
      let li = document.createElement('li');
      this.recipeToLi.set(recipe, li);
      let ul = this.getRecipeUl({recipe});
      ul.appendChild(li);
    }
    return this.recipeToLi.get(recipe);
  }
  removeRecipe({recipe}){
    let li = this.getRecipeLi({recipe});
    let ul = this.getRecipeUl({recipe});
    if(ul.childNodes.lenght == 1){
      ul.parentElement.removeChild(ul);
    }else{
      ul.removeChild(li);
    }
  }
  addRecipe({recipe}){
    let li = this.getRecipeLi({recipe});
    li.innerText = recipe.name;
  }
  getRecipeUl({recipe}){
    let recipeType = recipe.type;
    this.recipeTypeToUl = this.recipeTypeToUl || new Map();
    if(! this.recipeTypeToUl.has(recipeType)){
      let ul = document.createElement('ul');
      this.recipeTypeToUl.set(recipeType, ul);
      let ulDiv = document.createElement('div');
      ulDiv.appendChild(helpers.createTitle({text: recipe.type + ' :', h:'h4'}))
      ulDiv.appendChild(ul);
      this.container.appendChild(ulDiv);
    }
    return this.recipeTypeToUl.get(recipeType);
  }
}

class RouteRenderer{
	constructor({container}){
		this.container = container;
		this.container.appendChild(helpers.createTitle({text: 'Angular Routes : '}))
	}
}

class AngularPanel{
  constructor({documentEditor, containerId}){
    this.documentEditor = documentEditor;
    this.panelContainer = document.getElementById(containerId);

    this.initScriptRenderer();
    this.initRecipeRenderer();

		this.angularPage = new AngularPage({documentEditor});
		this.initAngularPageEvents();

    this.initScripts();

		this.listenToDocumentEditorEvents();
  }

	listenToDocumentEditorEvents(){
		this.documentEditor.onElementSelected(({element})=>{
			let elementNControllerName = helpers.getParentsWithAttribute({element, attribute: 'ng-controller'});

			let controllers = elementNControllerName
				.map(({controllerName})=>{
					return this.angularPage.getRecipeByName({name:controllerName});
				}).filter(helpers.isOk);
			this.recipeRenderer.highlightRecipes({recipes:controllers});

			let scripts = controllers
				.map((recipe)=>{
					return this.angularPage.getScriptOfRecipe({recipe});
				}).filter(helpers.isOk);
			this.scriptsRenderer.highlightScripts({scripts});

			let dependencies = this.angularPage.getDependenciesOfRecipes({recipes: controllers});
			this.recipeRenderer.highlightRecipes({recipes: dependencies, level: '1'});

			let dependenciesScripts = dependencies
				.map((recipe)=>{
					return this.angularPage.getScriptOfRecipe({recipe});
				}).filter(helpers.isOk);
			this.scriptsRenderer.highlightScripts({scripts: dependenciesScripts, level:'1'});

			let dependenciesDependencies = this.angularPage.getDependenciesOfRecipes({recipes: dependencies});
			this.recipeRenderer.highlightRecipes({recipes: dependenciesDependencies, level: '2'});

			let dependenciesDependenciesScripts = dependenciesDependencies
				.map((recipe)=>{
					return this.angularPage.getScriptOfRecipe({recipe});
				}).filter(helpers.isOk);
			this.scriptsRenderer.highlightScripts({scripts: dependenciesDependenciesScripts, level: '2'});
		});
	}

  initScripts(){
    let scripts = this.documentEditor.scripts;
    this.scriptsRenderer.render({scripts});
    this.documentEditor.onAddScript(({script})=>{
      this.scriptsRenderer.addScript({script});
    });
    this.documentEditor.onRemoveScript(({script})=>{
      this.scriptsRenderer.removeScript({script});
    });
  }

  initAngularPageEvents(){
    this.angularPage.
      onAddRecipe(({recipe})=>{
        this.recipeRenderer.addRecipe({recipe});
      })
      .onRemoveRecipe(({recipe})=>{
        this.recipeRenderer.removeRecipe({recipe});
      });
  }
  initRecipeRenderer(){
    this.recipeRendererContainer = document.createElement('div');
    this.panelContainer.appendChild(this.recipeRendererContainer);
    this.recipeRenderer = new RecipeRenderer({container:this.recipeRendererContainer});
  }
  initScriptRenderer(){
    this.scriptsRendererContainer = document.createElement('div');
    this.panelContainer.appendChild(this.scriptsRendererContainer);
    this.scriptsRenderer = new ScriptsRenderer({
			container: this.scriptsRendererContainer
		});

		let button  = document.createElement('button');
		button.innerText = 'Reorganise';
		button.onclick = ()=>{
			let selectedScripts = this.scriptsRenderer.getSelectedScripts();
			let newScripts = selectedScripts
				.reduce((arrNewScripts, script)=>{
					// newApplicationScripts
					let applicationsNames = this.angularPage.getApplicationsNamesOfScript({script});
					let applicationsScripts = applicationsNames
						.map((applicationName)=>{
							let applicationInfos = this.angularPage.getApplicationInfos({applicationName});
							if(!applicationInfos){
								return null;
							}
							let declarationCode = helpers.getDeclarationCodeOfApplication({applicationInfos});
							return this.documentEditor.scriptManager.createEmbdedScript({
								content: declarationCode,
								text: 'Application '+applicationInfos.applicationName
							});
						}).filter(helpers.isOk);
					arrNewScripts = arrNewScripts.concat(applicationsScripts);
					// recipes scripts
					let recipesScripts = this.angularPage.getRecipesByScript({script})
						.map((recipe)=>{
							let code = recipe.code;
							return this.documentEditor.scriptManager.createEmbdedScript({
								content: code,
								text: recipe.type+' '+recipe.name
							});
						});
					return arrNewScripts.concat(recipesScripts);
					// embeded create a new script/scripts that containe the script informations
				}, []);

			this.documentEditor.addRemoveScripts({
				scriptsToAdd: newScripts,
				scriptsToRemove: selectedScripts
			});
		};
		this.scriptsRendererContainer.appendChild(button);
	}
}


export default AngularPanel;
