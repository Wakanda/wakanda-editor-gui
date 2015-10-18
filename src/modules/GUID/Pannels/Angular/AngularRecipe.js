import recipeTypes from './recipeTypes';

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

  get applicationName(){
    return this._applicationName;
  }

  // get script(){
  //   return this._fromScript;
  // }

  get functionCode(){
    return this._content.toString();
  }

  get dependenciesNames(){
    return this._dependenciesNames;
  }

  get code(){
    if(this.type === recipeTypes.recipes.config){
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

export default AngularRecipe;
