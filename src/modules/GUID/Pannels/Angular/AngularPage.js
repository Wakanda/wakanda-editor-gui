import magicAngular from './magicAngular';
import recipeTypes from './recipeTypes';
import AngularRecipe from './AngularRecipe';
import MultiEvent from '../../../../../lib/multi-event-master/src/multi-event-es6.js';

let helpers = {
  createRecipes({applicationInfos}){
    let recipes = applicationInfos.recipes;
    let applicationName = applicationInfos.applicationName;
    return recipeTypes.getAsArray()
    .map((recipeType)=>{
      let currentRecipes = recipes[recipeType] || []; // of type {{recipeType}} you got the {{}} :p
      // TODO: there is surely something to improve here
      return currentRecipes.map((currentRecipe)=>{
        return this.createRecipe({recipe: currentRecipe, recipeType, applicationName});
      });
    }).reduce((allRecips, currentRecips)=>{
      return allRecips.concat(currentRecips);
    }, []);
  },
  createRecipe({recipe, recipeType, applicationName}){
    let recipeContent = recipe[recipeType + 'Content'];
    let recipeName = recipe[recipeType + 'Name'];
    return new AngularRecipe({
      applicationName,
      recipeType,
      recipeContent,
      recipeName
    });
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
  constructor({documentEditor}){
    this.documentEditor = documentEditor;

    this.applicationsNames = new Set();
    this.applicationNameToScript = new Map();
    this.applicationNameToInfos = new Map();
    this.recipesMap = new Map();
    this.recipeToScript = new Map();

    this.events = new MultiEvent();

    this.scriptsPromise = Promise.resolve([]);
    this.syncWithDocument();
  get configRecipe(){
    return this.getRecipeByName({name: 'config'});
  }
  syncWithDocument(){
    this.documentEditor.scripts.forEach((script)=>{
      this.addScript({script});
    });
    this.documentEditor.onAddScript(({script})=>{
      this.addScript({script});
    });
    this.documentEditor.onRemoveScript(({script})=>{
      this.removeScript({script});
    });
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
  onConfigRecipeChange(callBack){
    this.events.on('recipe.*', function({recipe}){
      let eventName = this.eventName
      let eventType = eventName.split('.').pop();
      if(recipe.type === 'config'){
        callBack({configRecipe: recipe});
      }
    });
  }
  getDependenciesOfRecipes({recipes}){
		// NOTE: temporary
		let isOk = (o)=>{return !!o;};
    return recipes.reduce((arrNames, recipe)=>{
       return arrNames.concat(recipe.dependenciesNames);
    },[]).filter(isOk)
    .map((name)=>{
      return this.getRecipeByName({name});
    }).filter(isOk);
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
  getApplicationsNamesOfScript({script}){
    let applicationsNames = [];
    [... this.applicationNameToScript.keys()]
      .forEach((applicationName)=>{
        if(this.applicationNameToScript.get(applicationName) === script){
          applicationsNames.push(applicationName);
        }
      });
    return applicationsNames;
  }
  getScriptOfRecipe({recipe}){
    if(this.recipeToScript.has(recipe)){
      return this.recipeToScript.get(recipe);
    }else{
      return null;
    }
  }
  getRecipeByName({name}){
    if(this.recipesMap.has(name)){
      return this.recipesMap.get(name);
    }else{
      return null;
    }
  }
  removeScript({script}){
    this.scriptsPromise = this.scriptsPromise.then((scriptArray)=>{
      let idx = scriptArray.indexOf(script);
      if(idx !== -1){
        scriptArray.splice(idx, 1);
        let recipes = this.getRecipesByScript({script});
        recipes.forEach((recipe)=>{
          this.removeRecipe({recipe});
        });
        let applicationsNames = this.getApplicationsNamesOfScript({script});
        applicationsNames.forEach((applicationName)=>{
          if(this.applicationNameToScript.has(applicationName)){
            this.applicationNameToScript.delete(applicationName);
            this.applicationNameToInfos.delete(applicationName);
          }
        })
      }
      return scriptArray;
    });
  }
  getApplicationInfos({applicationName}){
    return this.applicationNameToInfos.get(applicationName);
  }
  addScript({script}){
    this.scriptsPromise = this.scriptsPromise.then((scriptArray) => {
      let scriptAddedPromise = helpers.extractInfos({script})
        .then(({applications})=>{
          applications.forEach((application)=>{
            let applicationName = application.applicationName;
            if(application.declaration){
              this.applicationNameToScript.set(applicationName, script);
              // NOTE:  temporary
              this.applicationNameToInfos.set(applicationName, application);
            }
            let allRecipes = helpers.createRecipes({applicationInfos: application});
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
