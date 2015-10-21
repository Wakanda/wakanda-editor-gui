import AngularRecipe from './AngularRecipe';
import MultiEvent from '../../../../../../lib/multi-event-master/src/multi-event-es6.js';
import helpers from '../helpers';
// TODO: somme refactoring
class Routes {
  constructor({angularPage, changeCallBack}){
    this.documentEditor = angularPage.documentEditor;
    this.configRecipe = angularPage.configRecipe;
    this.angularPage = angularPage;

    this._changeCallBack = changeCallBack;

    this.draftMap = new Map();

    this.syncToFindViewElement();
    this.syncWithAngularPage();
    this.listenToTemplateChanges();
  }
  isDirty({path}){
    return !!this.draftMap.get(path);
  }
  setDraft({path = this.currentView, content}){
    this.draftMap.set(path, content);
  }
  saveTemplate({path}){
    if(this.draftMap.has(path)){
      let newContent = this.draftMap.get(path);
      let routes = this.routes;
      let route = routes.get(path);
      route.template = newContent;
      routes.set(path, route);
      this.draftMap.delete(path);
      this.updateRoutesOnConfigRecipe();
    }
  }
  updateRoutesOnConfigRecipe(){
    //  1- reorganize config script
    let configRecipe = this.angularPage.configRecipe;
    let configScript = this.angularPage.getScriptOfRecipe({recipe: configRecipe});
    this.angularPage.reorganizeScripts({scripts: [configScript]});
    //  2- remove configScript
    configRecipe = this.angularPage.configRecipe;
    configScript = this.angularPage.getScriptOfRecipe({recipe: configRecipe});
    let applicationName = configRecipe.applicationName;
    this.documentEditor.removeScript({script: configScript});
    //  3- add new config Script
    let newConfigCode = helpers.getConfigRoutesCode({routes: this.routes, otherwise: this.otherwise, applicationName});
    let newConfigScript = this.documentEditor.scriptManager.createEmbdedScript({
      content: newConfigCode,
      text: 'Route configs'
    });
    this.documentEditor.addScript({script: newConfigScript});
  }
  listenToTemplateChanges(){
    this.documentEditor.onElementChange(({changeType, element, parent})=>{
      let inTemplate = helpers.parentalTest({
        parent: this._viewElement,
        child: parent
      });
      if(inTemplate){
        let newTemplate = helpers.domElementsToString({elements: this._viewElement.children});
        this.setDraft({content: newTemplate});
      }
    });
  }
  get routes(){
    this._routes;
  }
  get otherwise(){
    this._otherwise;
  }
  get currentView(){
    if(this._currentView){
      return this._currentView;
    }else{
      return null;
    }
  }
  selectView({path}){
    this._currentView = path;
    let templateContent = this.routes.get(path).template;
    let elements = helpers.stringToDomElements({
      documentParent: this.documentEditor.document,
      content: templateContent
    });
    this.documentEditor.temporaryBroker.setToinitialState();
    [...elements].forEach((element)=>{
      this.documentEditor.temporaryAppendElement({ element, parent: this._viewElement });
    });
  }
  addRoute({path, route}){
    console.warn('not yet implemented');
    // TODO: daba
  }
  removeRoute({path}){
    console.warn('not yet implemented');
    // TODO: daba
  }
  setOtherwise({params}){
    console.warn('not yet implemented');
    // TODO: daba
  }
  get routes(){
    return this._routes;
  }
  get otherwise(){
    return this._otherwise;
  }
  syncWithAngularPage(){
    // TODO: emit on load
    this.configRecipe = this.configRecipe;
    this.getInfosFromConfigRecipe();
    this.angularPage.onConfigRecipeChange(({configRecipe})=>{
      this.configRecipe = configRecipe;
      this.getInfosFromConfigRecipe();
    });
  }
  getInfosFromConfigRecipe(){
    let args = (!! this.configRecipe) && this.configRecipe.recipeArguments;
    if(!args){
      console.log('no config recipe');
    }else if( args.length === 1 ){
      let arg = args[0];
      if(arg === '$routeProvider'){
        // TODO: find more efficient way to do this (for example but it in the recipe object ..)
        let fakeRouteProvider = {
          'when': function(path, route){
            this._routes.set(path, route);
            return this;
          },
          'otherwise': function (params) {
            this._otherwise = params;
            return this;
          }
        }
        fakeRouteProvider._routes = new Map();
        // fakeRouteProvider._otherwise;
        let thisArg = {}
        this.configRecipe.functionContent.call(thisArg, fakeRouteProvider);

        this._routes = fakeRouteProvider._routes;
        this._otherwise = fakeRouteProvider._otherwise;

        this._changeCallBack(this);
      }
    }else{
      console.error('not yet implemented');
    }
  }
  syncToFindViewElement(){
    let ngvAttName = 'ng-view';
    this._viewElement = this.documentEditor.document.querySelector(`[${ngvAttName}]`);
    this.documentEditor.onElementChange(({/*changeType, */element})=>{
      if(element.getAttribute(ngvAttName) !== null){
        this._viewElement = element;
      }else if (element === this.viewElement){
        this._viewElement = element;
      }
    });
  }
  get viewElement(){
    if(this._viewElement){
      return this._viewElement;
    }else{
      return null;
    }
  }
}

class AngularPage {
  constructor({documentEditor}){
    this.documentEditor = documentEditor;

    this.applicationNameToScript = new Map();
    this.applicationNameToInfos = new Map();
    this.recipesMap = new Map();
    this.recipeToScript = new Map();

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
