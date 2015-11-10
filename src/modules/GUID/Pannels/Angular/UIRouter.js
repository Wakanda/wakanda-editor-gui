const UIDIRATTNAME = 'ui-view';

class UIRouter {
	constructor({ angularPage	}) {
		this._angularPage = angularPage;
		this._recipeConfig = this._angularPage.configRecipe;
		this._otherwise = null;
		this._statesMap = new Map();
    this._viewElement = null;

		this.initRoutes();
	}

	initRoutes() {
		let $stateProvider = {},
		    $urlRouterProvider = {};

		$stateProvider.state = (stateName, opts) => {
			this._statesMap.set(stateName, opts);

			return $stateProvider; //this
		};
		$urlRouterProvider.otherwise = (otherwise) => {
			this._otherwise = otherwise;
		};

		let dependencies = { $stateProvider, $urlRouterProvider };

		this._recipeConfig.executeWithDependencies({ dependencies });

    // find viewElement
    let viewElement = this._angularPage.documentEditor.document.querySelector(`[${UIDIRATTNAME}]`);

    this._angularPage.documentEditor.onElementChange(({/*changeType, */element})=>{
      // TODO: in case of deletion of parent ...
      if(element.getAttribute(UIDIRATTNAME) !== null){
        this._viewElement = element;
      }else if (element === this.viewElement){
        this._viewElement = null;
      }
    });

    this._viewElement = viewElement
  }
  get viewElement(){
    return this._viewElement;
  }

  set viewElement(viewElement){
    let elements = [this._viewElement, viewElement],
        attributes = [UIDIRATTNAME, UIDIRATTNAME],
        values = [null, ""];

    this._angularPage.documentEditor.changeElementAttributes({elements, attributes, values});
  }

  getState({stateName}){
    return this._statesMap.get(stateName);
  }
  setState({stateName, options}){
    this._statesMap.set(stateName, options);
    this.updateScript();
  }
  setOtherwise(otherwise){
    this._otherwise = otherwise;
    this.updateScript;
  }

  get otherwise(){
    return this._otherwise;
  }

  get statesMap(){
    return this._statesMap;
  }
	get states(){
		return Array.from(this._statesMap.keys());
	}

	get generatedCode() {
		let applicationName = this._angularPage.applicationName;

		let code = `
    angular.module('${applicationName}');
        myApp.config(function($stateProvider, $urlRouterProvider) {
            //
            // For any unmatched url, redirect to /${this._otherwise}
            $urlRouterProvider.otherwise("/${this._otherwise}");
            //
            // the states
            $stateProvider`;
		this._statesMap.forEach((val, key, map) => {
			code += `
              .state('${key}', ${JSON.stringify(val)})
      `;
		})
		code += `;
  });
      `;
    return code;
	}
}









export default UIRouter;
