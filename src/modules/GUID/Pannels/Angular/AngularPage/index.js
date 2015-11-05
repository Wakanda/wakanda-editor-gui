import Routes from './Routes';
import AngularRecipe from './AngularRecipe';
import helpers from '../../helpers';

const NGAPPATTRIBUTE = 'ng-app';
const NGCTRLATTRIBUTE = 'ng-controller';

class AngularPage {
  constructor({documentEditor}){
    this.documentEditor = documentEditor;

    this._applicationElement = this.documentEditor.document.querySelector(`[${NGAPPATTRIBUTE}]`);

    this.applicationNameToScript = new Map();
    this.applicationNameToInfos = new Map();
    this.recipesMap = new Map();
    this.recipeToScript = new Map();

    this.controllerToElement = new Map();

    var MultiEvent = require('multi-event');
    this.events = new MultiEvent();

    this.scriptsPromise = Promise.resolve([]);

    this.syncWithDocument();

    // after loading recipes
    this._routesPromise = this.scriptsPromise.then(()=>{
      this._routes = new Routes({
        angularPage: this,
        changeCallBack: (routesInstance)=>{
          this.events.emit('routes.change', {routesInstance});
        }
      });
    });
  }
  get ready(){
    return this.scriptsPromise.then(()=>{
      return this;
    });
  }
  get recipes(){
    return Array.from(this.recipesMap.values());
  }
  setControllerToElement({controller, element = this.documentEditor.selectedElement}){
    let oldControllerElement = this.getControllerElement({controller});
    let elements = [],
        attributes = [],
        values = [];
    if(oldControllerElement && oldControllerElement.getAttribute(NGCTRLATTRIBUTE)){
      elements.push(oldControllerElement);
      attributes.push(NGCTRLATTRIBUTE);
      values.push(null);
    }
    elements.push(element);
    attributes.push(NGCTRLATTRIBUTE);
    values.push(controller.name);

    this.controllerToElement.set(controller, element);

    this.documentEditor.changeElementAttributes({elements, attributes, values});
  }
  getControllerElement({controller}){
    return this.controllerToElement.get(controller);
  }
  get applicationName(){
    let applicationElement = this.applicationElement;
    if(applicationElement){
      let ngAppAttContent = this.applicationElement.getAttribute(NGAPPATTRIBUTE);
      if(!this.applicationNameToScript.has(ngAppAttContent)){
        console.warn('arror');
      }
      return ngAppAttContent; //must be just one
    }else{
      return null;
    }
  }
  reorganizeScripts({scripts: selectedScripts}){
    let newScripts = selectedScripts
      .reduce((arrNewScripts, script)=>{
        // newApplicationScripts
        let applicationsNames = this.getApplicationsNamesOfScript({script});
        let applicationsScripts = applicationsNames
          .map((applicationName)=>{
            let applicationInfos = this.getApplicationInfos({applicationName});
            if(!applicationInfos){
              return null;
            }
            let declarationCode = helpers.getDeclarationCodeOfApplication({applicationInfos});
            return this.documentEditor.scriptManager.createEmbdedScript({
              content: declarationCode,
              text: 'Application '+applicationInfos.applicationName
            });
          }).filter(helpers.isOk);
        arrNewScripts = arrNewScripts.concat(applicationsScripts);
        // recipes scripts
        let recipesScripts = this.getRecipesByScript({script})
          .map((recipe)=>{
            let code = recipe.code;
            return this.documentEditor.scriptManager.createEmbdedScript({
              content: code,
              text: recipe.type+' '+recipe.name
            });
          });
        return arrNewScripts.concat(recipesScripts);
        // embeded create a new script/scripts that containe the script informations
      }, []);

    this.documentEditor.addRemoveScripts({
      scriptsToAdd: newScripts,
      scriptsToRemove: selectedScripts
    });
  }
  get applicationElement(){
    if (this._applicationElement){
      return this._applicationElement;
    }else{
      return null;
    }
  }
  setApplicationToSelectedElement({applicationName}){
    let selectedElement = this.documentEditor.selectedElement;
    if(!selectedElement){
      return false;
    }
    let currentApplicationName = this.applicationName;
    let oldApplicationScript = this.applicationNameToScript.get(currentApplicationName);

    this.setApplicationElement({
      applicationElement: selectedElement,
      applicationName
    });

    let declarationCode = `
      angular.module('${applicationName}', []);
    `;

    let script = this.documentEditor.scriptManager.createEmbdedScript({
      content: declarationCode,
      text: 'Application '+ applicationName
    });

    this.documentEditor.addRemoveScripts({
      scriptsToAdd: [script],
      scriptsToRemove: oldApplicationScript ? [oldApplicationScript] : []
    });

    return true;
  }
  setApplicationElement({applicationElement, applicationName}){
    let oldApplicationElement = this.applicationElement;
    let elements = [],
        attributes = [],
        values = [];

    if(oldApplicationElement && oldApplicationElement.getAttribute(NGAPPATTRIBUTE)){
      elements.push(oldApplicationElement);
      attributes.push(NGAPPATTRIBUTE);
      values.push(null);
    }
    elements.push(applicationElement);
    attributes.push(NGAPPATTRIBUTE);
    values.push(applicationName);

    this._applicationElement = applicationElement

    this.documentEditor.changeElementAttributes({elements, attributes, values});
  }
  get routesPromise(){
    return this._routesPromise;
  }
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
  onRoutesChage(callBack){
    this.events.on('routes.change', callBack);
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
    return recipes.reduce((arrNames, recipe)=>{
       return arrNames.concat(recipe.dependenciesNames);
    },[]).filter(helpers.isOk)
    .map((name)=>{
      return this.getRecipeByName({name});
    }).filter(helpers.isOk);
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
            let allRecipes = AngularRecipe.createRecipes({applicationInfos: application});
            allRecipes.forEach((recipe)=>{
              this.recipeToScript.set(recipe, script);
              this.addRecipe({recipe});
            });
          });
          return script;
        });
      return Promise.all([...scriptArray, scriptAddedPromise]);
    });
  }
}

export default AngularPage;
