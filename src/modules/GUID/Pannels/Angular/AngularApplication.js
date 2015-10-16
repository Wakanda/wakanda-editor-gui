import recipeTypes from './recipeTypes';

// TODO: dependencies and dependenciesNames
class AngularApplication{
  constructor({application, script}){
    this.applicationName = application.applicationName;
    this._dependenciesNames = application.dependencies;

    // this._dependecies = [];

    if(application.declaration){
      this._script = script;
    }

    this._recipes = this.getAllRecipes({application, fromScript: script});
  }

  findRecipeByName({name}){
    // TODO: optimisation cache (reset when change)
    for(let recipe of this._recipes){
      if(recipe.name === name){
        return recipe;
      }
    }
    for(let app of this.dependecies){
      let recipe = app.findRecipeByName({name});
      if(recipe){
        return recipe;
      }
    }
  }

  addRecipe({recipe}){
    this._recipes.push(recipe);
  }

  addRecipes({recipes}){
    Array.prototype.push.apply(this._recipes, recipes);
  }

  // addDependency({application}){
  //   this._dependecies.push(application);
  // }

  // addDependencies({applications}){
  //   Array.prototype.push.apply(this._dependecies, applications);
  // }

  get code(){
    if(this.script){
      let dependenciesNamesCode = this.dependenciesNames.map((s)=>`'s'`).join(', ');
      return `
      (function(angular){
        angular.module('${this.name}', [${dependenciesNamesCode}]);
      })(angular);
      `;
    }
    else{
      return null;// no need for code here
    }
  }

  get allControllers(){
    let thisAppcontrollers = this._recipes.filter((recipe) => recipe.type === recipeTypes.recipes.controller);
    let allControllers = this.dependencies.reduce((allctrl, currentApplication)=>{
      return allctrl.concat(currentApplication.allControllers);
    }, thisAppcontrollers);

    return allControllers;
  }

  get dependenciesNames(){
    return this._dependenciesNames;
  }

  // get dependencies(){
  //   return this._dependecies;
  // }

  get recipes(){
    return this._recipes;
  }

  get script(){
    if(this._script){
      return this._script;
    }else{
      return null;
    }
  }

  get name(){
    return this.applicationName;
  }

  getAllRecipes({application, fromScript}){
    return recipeTypes.getAsArray()
    .map((recipeType)=>{
      let currentRecipes = application.recipes[recipeType] || []; // of type {{recipeType}} you got the {{}} :p
      // TODO: there is surely something to improve here
      return currentRecipes.map((currentRecipe)=>{
        return this.createRecipe({recipe: currentRecipe, recipeType, script: fromScript});
      });
    }).reduce((allRecips, currentRecips)=>{
      return allRecips.concat(currentRecips);
    }, []);
  }
  createRecipe({recipe, recipeType, script}){
    let recipeContent = recipe[recipeType + 'Content'];
    let recipeName = recipe[recipeType + 'Name'];
    return new AngularRecipe({application: this, recipeType, recipeContent, recipeName , fromScript: script});
  }

};


export default AngularApplication;
