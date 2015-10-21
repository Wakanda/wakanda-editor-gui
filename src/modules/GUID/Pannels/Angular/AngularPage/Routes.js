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

export default Routes;
