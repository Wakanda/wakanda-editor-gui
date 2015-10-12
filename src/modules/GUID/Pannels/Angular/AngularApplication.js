class AngularRecipe{
  constructor({recipeContent, recipeType, recipeName}){
    this._type = recipeType;
    this.name = recipeName;

    let {dependencies, functionObject} = AngularRecipe.getDependenciesAndFunction({recipeContent});

    this.dependencies = dependencies;
    this.content = functionObject;
  }

  getRecipesFromPvovider(){
    if(this.type == 'config'){
      // NOTE: temporary
      let magicProvide = {
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
      console.warn('this is not aa config recipe');
      return null;
    }
  }

  get type(){
    return this._type;
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

class AngularApplication{
  constructor({application}){
    this.applicationName = application.applicationName;
    this._dependenciesNames = application.dependencies;

    this._recipes = AngularApplication.getAllRecipes({application});
  }
  static getAllRecipes({application}){
    return ['controller','factory','service','provider','directive','filter','constant','config']
    .map((recipeType)=>{
      let currentRecipes = application.recipes[recipeType] || []; // of type {{recipeType}} you got the {{}} :p
      // TODO: there is surely something to improve here
      return currentRecipes.map((currentRecipe)=>{
        return AngularApplication.createRecipe({recipe: currentRecipe, recipeType});
      });
    }).reduce((allRecips, currentRecips)=>{
      return allRecips.concat(currentRecips);
    });
  }
  static createRecipe({recipe, recipeType}){
    let recipeContent = recipe[recipeType + 'Content'];
    let recipeName = recipe[recipeType + 'Name'];
    return new AngularRecipe({recipeType, recipeContent, recipeName });
  }

};


export default AngularApplication;
