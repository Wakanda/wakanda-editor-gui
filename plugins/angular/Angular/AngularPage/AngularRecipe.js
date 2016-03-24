import helpers from '../helpers';
// TODO: neeed refactoring
class AngularRecipe{
  constructor({recipeContent, recipeType, recipeName, /*fromScript,*/ applicationName}){
    this._type = recipeType;
    this._name = recipeName || recipeType;
    // this._fromScript = fromScript;
    this._applicationName = applicationName;

    let {dependencies, functionObject} = AngularRecipe.getDependenciesAndFunction({recipeContent});

    this._dependenciesNames = dependencies;
    this._content = functionObject;

  }

  executeWithDependencies({thisArg = {}, dependencies}){
    let depNames = this.dependenciesNames;
    let argsArray = [];
    for(let depName of depNames){
      let currentArg = dependencies[depName];
      // FIXME: test just in debug vertion
      if( ! currentArg ){
        console.error('dependencies error');
      }
      argsArray.push(currentArg);
    }
    let retValue = this.functionContent.apply(thisArg, argsArray);
    // TODO: maybe return thisArg also
    return retValue;
  }

  get recipeArguments(){
    return this._dependenciesNames;
  }

  get applicationName(){
    return this._applicationName;
  }

  // get script(){
  //   return this._fromScript;
  // }

  get functionCode(){
    return this._content.toString();
  }
  get functionContent(){
    return this._content;
  }

  get dependenciesNames(){
    return this._dependenciesNames;
  }

  get code(){
    // TODO: use templates
    if(this.type === helpers.recipeTypes.recipes.config){
      let dependenciesCode = this._dependenciesNames
                                 .map((dep)=>`'${dep}'`)
                                 .join(', ');
      return `
        (function(app){
          app.config([${dependenciesCode}, ${this.functionCode}]);
        })(angular.module('${this.applicationName}'));
      `;
    }else{
      let dependenciesCode = this._dependenciesNames
                                 .map((dep)=>`'${dep}'`)
                                 .join(', ');
      return `
        (function(app){
          app.${this.type}('${this.name}', [${dependenciesCode}, ${this.functionCode}]);
        })(angular.module('${this.applicationName}'));
      `;
    }
  }

  getRecipesFromProvider(){
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
      dependencies = helpers.getFunctionParamsAsStringArray({func: recipeContent});
      functionObject = recipeContent;
    }else{
      console.warn("must be a constant, if not it's weird");
    }

    return {dependencies, functionObject};
  }

  static createRecipes({applicationInfos}){
    let recipes = applicationInfos.recipes;
    let applicationName = applicationInfos.applicationName;
    return helpers.recipeTypes.getAsArray()
      .map((recipeType)=>{
        let currentRecipes = recipes[recipeType] || []; // of type {{recipeType}} you got the {{}} :p
        // TODO: there is surely something to improve here
        return currentRecipes.map((currentRecipe)=>{
          let recipeName = currentRecipe[recipeType + 'Name'],
              recipeContent = currentRecipe[recipeType + 'Content'];
          return new AngularRecipe({
            applicationName,
            recipeType,
            recipeContent,
            recipeName
          });
        });
      })
      .reduce((allRecips, currentRecips)=>{
        return allRecips.concat(currentRecips);
      }, []);
  }

}

export default AngularRecipe;
