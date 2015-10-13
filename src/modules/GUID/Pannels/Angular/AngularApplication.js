import recipeTypes from './recipeTypes';

class AngularRecipe{
  constructor({recipeContent, recipeType, recipeName, script}){
    this._type = recipeType;
    this._name = recipeName;
    this._script = script;

    let {dependencies, functionObject} = AngularRecipe.getDependenciesAndFunction({recipeContent});

    this.dependencies = dependencies;
    this.content = functionObject;
  }

  get script(){
    return this._script;
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
      this.content.call(thisArg, magicProvide);

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

    this._recipes = AngularApplication.getAllRecipes({application, script});
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

  static getAllRecipes({application, script}){
    return recipeTypes.getAsArray()
    .map((recipeType)=>{
      let currentRecipes = application.recipes[recipeType] || []; // of type {{recipeType}} you got the {{}} :p
      // TODO: there is surely something to improve here
      return currentRecipes.map((currentRecipe)=>{
        return AngularApplication.createRecipe({recipe: currentRecipe, recipeType, script});
      });
    }).reduce((allRecips, currentRecips)=>{
      return allRecips.concat(currentRecips);
    }, []);
  }
  static createRecipe({recipe, recipeType, script}){
    let recipeContent = recipe[recipeType + 'Content'];
    let recipeName = recipe[recipeType + 'Name'];
    return new AngularRecipe({recipeType, recipeContent, recipeName , script});
  }

};


export default AngularApplication;
