import helpers from '../helpers';
import Renderer from '../Renderer';

class ApplicationRenderer extends Renderer{
  constructor({container, angularPage}){
    super({ title: 'Application', container });
    this._angularPage = angularPage;

    let {label, input, li} = helpers.createInputWithLabel({
      labelContent: 'application',
      content: this._angularPage.applicationName,
      withLi :true
    });

    let setAppButton = document.createElement('button');
    setAppButton.innerText = 'Set App on selected element';
    setAppButton.onclick = () => {
      let applicationName = input.value;
      this._angularPage.setApplicationToSelectedElement({applicationName});
    }
    li.appendChild(setAppButton);
    this.ul.appendChild(li);
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

export default ApplicationRenderer;
