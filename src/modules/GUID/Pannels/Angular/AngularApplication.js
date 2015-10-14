import recipeTypes from './recipeTypes';

class AngularRecipe{
  constructor({recipeContent, recipeType, recipeName, fromScript, application}){
    this._type = recipeType;
    this._name = recipeName;
    this._fromScript = fromScript;
    this._application = application;

    let {dependencies, functionObject} = AngularRecipe.getDependenciesAndFunction({recipeContent});

    this.dependenciesNames = dependencies;
    this._content = functionObject;
  }

  get application(){
    return this._application;
  }

  get script(){
    return this._fromScript;
  }

  get functionCode(){
    return this._content.toString();
  }

  get code(){
    if(this.type === recipeTypes.recipes.controller){
      let dependenciesCode = this.dependenciesNames
                                 .map((dep)=>`'${dep}'`)
                                 .join(', ');
      return `
(function(app){
  app.controller('${this.name}', [${dependenciesCode}, ${this.functionCode}]);
})(angular.module('${this.application.name}'));
      `;
    }else{
      console.error(this.type + ' not yet implemented');
    }
  }

  getRecipesFromPvovider(){
    if(this.type == 'config'){
      // NOTE: temporary
      let magicProvide = {
        // TODO: not only constant
        constant: function(constantName, constantValue){
          this.revipes = this.revipes || [];
          this.revipes.push({
            constantName: constantName,
            constantValue: constantValue
          });
        }
      };
      let thisArg = {};//for the moment
      this._content.call(thisArg, magicProvide);

      return magicProvide.revipes;

    }else{
      console.warn('this is not an config recipe');
      return null;
    }
  }

  get type(){
    return this._type;
  }

  get name(){
    return this._name;
  }

  static getDependenciesAndFunction({recipeContent}){
    let dependencies = [],
        functionObject;
    // TODO: there is two ways angular represents recipe dependencies, from array and from function
    if(recipeContent instanceof Array){
      // from array
      dependencies = recipeContent.slice(0);
      functionObject = dependencies.pop();
    }else if (recipeContent instanceof Function){
      // from function
      dependencies = AngularRecipe.getFunctionParamsAsStringArray({func: recipeContent});
      functionObject = recipeContent;
    }else{
      console.warn("must be a constant, if not it's weird");
    }

    return {dependencies, functionObject};
  }
  // NOTE: I do not write this function so, it must be rewritten (its probabely buggy) in future is is from
  //       http://stackoverflow.com/questions/1007981/how-to-get-function-parameter-names-values-dynamically-from-javascript
  static getFunctionParamsAsStringArray({func}){
    return func.toString()
    .replace(/((\/\/.*$)|(\/\*[\s\S]*?\*\/)|(\s))/mg,'')
    .match(/^function\s*[^\(]*\(\s*([^\)]*)\)/m)[1]
    .split(/,/);
  }

}
// TODO: dependencies and dependenciesNames
class AngularApplication{
  constructor({application, script}){
    this.applicationName = application.applicationName;
    this._dependenciesNames = application.dependencies;

    this._dependecies = [];

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

  addDependency({application}){
    this._dependecies.push(application);
  }

  addDependencies({applications}){
    Array.prototype.push.apply(this._dependecies, applications);
  }

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

  get dependencies(){
    return this._dependecies;
  }

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
