import {getFile, stringToDomElements, saveFileForPreview, domArrayToDocumentFragment, docFragmentToString} from '../helpers';
const UIDIRATTNAME = 'ui-view';

class UIRouter {
	constructor({ angularPage	}) {
		this._angularPage = angularPage;
		this._recipeConfig = this._angularPage.configRecipe;
		this._otherwise = null;
		this._statesMap = new Map();
		this._templatesMap = new Map();
    this._viewElement = null;

		this.initRoutes();
		this.ready = this.loadTemplates().then(()=>this);
	}
	selectView({stateName}){
		let docE = this._angularPage.documentEditor;
		docE.temporaryBroker.setToinitialState();
		let viewElement = this.viewElement;
		let stateArray = stateName.split('.');
		stateArray.forEach((subState, ii, arr) => {
			let currentState = '';
			for(let jj = 0; jj<=ii; jj++){
				currentState += jj>0?'.':'';
				currentState += arr[jj];
			}
			// TODO: daba save old content
			let templateUrl = this._statesMap.get(currentState).templateUrl;
			let templateContentAsDom = this._templatesMap.get(templateUrl);
			Array.prototype.forEach.call(templateContentAsDom, (element)=>{
				docE.temporaryAppendElement({element, parent: viewElement});
			});
			viewElement = viewElement.querySelector(`[${UIDIRATTNAME}]`);
		});
	}

	saveTemplate({stateName}){
		let stateArray = stateName.split('.');
		let currentViewElementClone = this.viewElement.cloneNode(true);
		let currentPath = this._angularPage.documentEditor.path;
		let rootFolder = currentPath.substring(0,currentPath.lastIndexOf("/")+1);

		let savePromises = [];

		stateArray.forEach((subState, ii, arr) => {
			let currentState = '';
			for(let jj = 0; jj<=ii; jj++){
				currentState += jj>0?'.':'';
				currentState += arr[jj];
			}
			let stateContent = this.getState({stateName: currentState});

			let templateUrl = stateContent.templateUrl;

			let templateAsArray = this._templatesMap.get(templateUrl);
			let clonedTemplateAsDocFrag = domArrayToDocumentFragment({domArray: templateAsArray}).cloneNode(true);
			{
				let tmpElementView;
				while (tmpElementView = clonedTemplateAsDocFrag.querySelector(`[${UIDIRATTNAME}]`)) {
					tmpElementView.parentElement.removeChild(tmpElementView);
				}
			}

			let templateTosave = docFragmentToString({documentFragment: clonedTemplateAsDocFrag});

			// NOTE: include templates management in the document Editor

			// this._templatesMap.set(templateUrl, templateTosave);
			let savePromise = saveFileForPreview({path: rootFolder+templateUrl, content: templateTosave});
			// FIXME: this is temporary (need fix asynchronous ...)

			savePromises.push(savePromise);
		});

		return Promise.all(savePromises);
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

			return $urlRouterProvider;
		};

		let dependencies = { $stateProvider, $urlRouterProvider };

		if(this._recipeConfig === null){
			console.warn('config recipe is missing');
		}else{
			this._recipeConfig.executeWithDependencies({ dependencies });
		}

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

    this._viewElement = viewElement;
  }
	loadTemplates(){
		let currentPath = this._angularPage.documentEditor.path;
		let rootFolder = currentPath.substring(0,currentPath.lastIndexOf("/")+1);
		let loadingTemplatesPromises = [];
		this._statesMap.forEach((opts, stateName)=>{
			// loading template
			let url = opts.templateUrl;
			let loadPromise = getFile({url: rootFolder+url}).then((templateContent)=>{
				let templateAsDom = Array.from(stringToDomElements({content: templateContent}));
				this._templatesMap.set(url, templateAsDom);
			});
			loadingTemplatesPromises.push(loadPromise)
		});

		return Promise.all(loadingTemplatesPromises);
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
