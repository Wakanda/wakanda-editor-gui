import AngularPage from './_AngularPage';
import recipeTypes from './_recipeTypes';

let helpers = {
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

	clearHlighting(){
		[... this.ul.childNodes].forEach((li)=>{
			li.classList.remove('highligh');
		});
	}

	highlightScript({scripts}){
		this.clearHlighting();
		scripts.forEach((script)=>{
			this.scriptTotag.get(script).parentElement.classList.add('highligh');
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
  highlightRecipes({recipes}){
    this.clearHlighting();
    recipes.forEach((recipe)=>{
      if(this.recipeToLi.has(recipe)){
        this.recipeToLi.get(recipe).classList.add('highligh');
      }else{
        console.warn('try to highlight unexisting component');
      }
    });
  }
  clearHlighting(){
		[... this.container.querySelectorAll('li')].forEach((li)=>{
			li.classList.remove('highligh');
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

class AngularPanel{
  constructor({documentEditor, containerId}){
    this.documentEditor = documentEditor;
    this.panelContainer = document.getElementById(containerId);

    this.initScriptRenderer();
    this.initRecipeRenderer();
    this.initAngularPage();

    this.initScripts();
  }
  initScripts(){
    let scripts = this.documentEditor.scripts;
    this.scriptsRenderer.render({scripts});
    this.documentEditor.onAddScript((script)=>{
      this.scriptsRenderer.addScript({script});
      this.angularPage.addScript({script});
    });
    this.documentEditor.onRemoveScript(({script})=>{
      this.scriptsRenderer.removeScript({script});
      this.angularPage.removeScript({script});
    });
  }

  initAngularPage(){
    this.angularPage = new AngularPage();
    this.angularPage.
      onAddRecipe(({recipe})=>{
        this.recipeRenderer.addRecipe({recipe});
      })
      .onRemoveRecipe(({recipe})=>{
        this.recipeRenderer.removeRecipe({recipe});
      });
    this.documentEditor.scripts.forEach((script)=>{
      this.angularPage.addScript({script});
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
    this.scriptsRenderer = new ScriptsRenderer({container: this.scriptsRendererContainer});
  }
}


export default AngularPanel;
