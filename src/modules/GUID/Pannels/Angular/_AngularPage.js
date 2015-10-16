import magicAngular from './_magicAngular';
import recipeTypes from './_recipeTypes';
import AngularRecipe from './_AngularRecipe';
import MultiEvent from '../../../../../lib/multi-event-master/src/multi-event-es6.js';

let helpers = {
  createRecipes({recipes}){
    return recipeTypes.getAsArray()
    .map((recipeType)=>{
      let currentRecipes = recipes[recipeType] || []; // of type {{recipeType}} you got the {{}} :p
      // TODO: there is surely something to improve here
      return currentRecipes.map((currentRecipe)=>{
        return this.createRecipe({recipe: currentRecipe, recipeType});
      });
    }).reduce((allRecips, currentRecips)=>{
      return allRecips.concat(currentRecips);
    }, []);
  },
  createRecipe({recipe, recipeType}){
    let recipeContent = recipe[recipeType + 'Content'];
    let recipeName = recipe[recipeType + 'Name'];
    return new AngularRecipe({application: this, recipeType, recipeContent, recipeName});
  },
  extractInfos({script}) {
  		return script
  			.codePromise
  			.then((code) => {
  				let allCode = `
  				${magicAngular}
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
  	}
};

class AngularPage {
  constructor(){
    this.applicationsNames = new Set();
    this.applicationNameToScript = new Map();
    this.recipesMap = new Map();
    this.recipeToScript = new Map();

    this.events = new MultiEvent();

    this.scriptsPromise = Promise.resolve([]);
  }
  // private
  removeRecipe({recipe}){
    let name = recipe.name;
    this.recipesMap.delete(name);
    this.recipeToScript.delete(name);
    this.events.emit('recipe.remove', {recipe});
  }
  // private
  addRecipe({recipe}){
    let name = recipe.name;
    if(this.recipesMap.has(name)){
      console.error('fatal error for the moment');
    }else{
      this.recipesMap.set(name, recipe);
      this.events.emit('recipe.add', {recipe});
    }
  }
  onAddRecipe(callBack){
    this.events.on('recipe.add', callBack);
    return this;
  }
  onRemoveRecipe(callBack){
    this.events.on('recipe.remove', callBack);
    return this;
  }
  getRecipesByScript({script}){
    let ret = [];
    [...this.recipeToScript.keys()].forEach((recipe)=>{
      if(this.recipeToScript.get(recipe) === script){
        ret.push(recipe);
      }
    });
    return ret;
  }
  removeScript({script}){
    this.scriptsPromise = this.scriptsPromise.then((scriptArray)=>{
      let idx = scriptArray.indexOf(script);
      if(idx !== -1){
        scriptArray.splice(idx, 1);
        let recipes = this.getRecipesByScript({script});
        recipes.forEach((recipe)=>{
          this.removeRecipe({recipe});
        })
      }
      return scriptArray;
    });
  }
  addScript({script}){
    this.scriptsPromise = this.scriptsPromise.then((scriptArray) => {
      let scriptAddedPromise = helpers.extractInfos({script})
        .then(({applications})=>{
          applications.forEach((application)=>{
            let applicationName = application.applicationName;
            if(application.declaration){
              this.applicationNameToScript.set(applicationName, script);
            }
            let allRecipes = helpers.createRecipes({recipes: application.recipes});
            allRecipes.forEach((recipe)=>{
              this.addRecipe({recipe});
              this.recipeToScript.set(recipe, script);
            });
          });
          return script;
        });
      return Promise.all([...scriptArray, scriptAddedPromise]);
    });
  }
}

export default AngularPage;
