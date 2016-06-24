import helpers from '../helpers';

class RecipeRenderer{
  constructor({container, angularPage}){
    this.container = container;
    this._angularPage = angularPage;

    this.recipeToLi = new WeakMap();
    this.container.appendChild(helpers.createTitle({text: 'Angular Components : '}));

    let addControllerButton = document.createElement('button');
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
    li.appendChild(this.getEditRecipeButton({recipe}));
    if(recipe.type === helpers.recipeTypes.recipes.controller){
      li.appendChild(this.getBindControllerButton({recipe}));
    }
  }
  getBindControllerButton({recipe}){
    let bindCtrlButton = document.createElement('button');
    bindCtrlButton.innerText = 'bind';
    bindCtrlButton.onclick = ()=>{
      this._angularPage.setControllerToElement({controller: recipe});
    };
    return bindCtrlButton;
  }
  getEditRecipeButton({recipe}){
    let editButton = document.createElement('button');
    editButton.innerText = 'edit';
    let script = this._angularPage.getScriptOfRecipe({recipe});
    editButton.onclick = ()=>{
      //TODO emit changes (change via documentEditor)
      helpers.editScript(script);
    };
    return editButton;
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

export default RecipeRenderer;
