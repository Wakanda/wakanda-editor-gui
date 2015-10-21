import AngularPage from './AngularPage';
import {ScriptsRenderer, RecipeRenderer, RoutesRenderer} from './Renderers';
import helpers from './helpers';

class AngularPanel{
  constructor({documentEditor, containerId}){
    this.documentEditor = documentEditor;
    this.panelContainer = document.getElementById(containerId);

    this._scriptsRenderer = this.initScriptRenderer();
    this._recipeRenderer = this.initRecipeRenderer();
		this._routesRenderer = this.initRoutesRenderer();

		this.angularPage = new AngularPage({documentEditor});
		this.initAngularPageEvents();

		this.listenToDocumentEditorEvents();

    this.initScripts();
  }

	initRoutesRenderer(){
		let routesRendererContainer = document.createElement('div');
		this.panelContainer.appendChild(routesRendererContainer);

		let routesRenderer = new RoutesRenderer({
			container: routesRendererContainer,
			documentEditor: this.documentEditor
		});
    // FIXME: for debug
    window.r = routesRenderer;

    return routesRenderer;
	}

	highlightControllerAndDependencies({controllersNames}){
		let controllers = controllersNames
			.map((controllerName)=>{
				return this.angularPage.getRecipeByName({name:controllerName});
			}).filter(helpers.isOk);
		this._recipeRenderer.highlightRecipes({recipes:controllers});

		let scripts = controllers
			.map((recipe)=>{
				return this.angularPage.getScriptOfRecipe({recipe});
			}).filter(helpers.isOk);
		this._scriptsRenderer.highlightScripts({scripts});

		let dependencies = this.angularPage.getDependenciesOfRecipes({recipes: controllers});
		this._recipeRenderer.highlightRecipes({recipes: dependencies, level: '1'});

		let dependenciesScripts = dependencies
			.map((recipe)=>{
				return this.angularPage.getScriptOfRecipe({recipe});
			}).filter(helpers.isOk);
		this._scriptsRenderer.highlightScripts({scripts: dependenciesScripts, level:'1'});

		let dependenciesDependencies = this.angularPage.getDependenciesOfRecipes({recipes: dependencies});
		this._recipeRenderer.highlightRecipes({recipes: dependenciesDependencies, level: '2'});

		let dependenciesDependenciesScripts = dependenciesDependencies
			.map((recipe)=>{
				return this.angularPage.getScriptOfRecipe({recipe});
			}).filter(helpers.isOk);
		this._scriptsRenderer.highlightScripts({scripts: dependenciesDependenciesScripts, level: '2'});
	}

	listenToDocumentEditorEvents(){
		this.documentEditor.onElementSelected(({element})=>{
			let elementNControllerName = helpers.getParentsWithAttribute({element, attribute: 'ng-controller'});

			let controllersNames = elementNControllerName.map(({controllerName})=>controllerName);

			this.highlightControllerAndDependencies({controllersNames});

		});
	}

  initScripts(){
    let scripts = this.documentEditor.scripts;
    this._scriptsRenderer.render({scripts});
    this.documentEditor.onAddScript(({script})=>{
      this._scriptsRenderer.addScript({script});
    });
    this.documentEditor.onRemoveScript(({script})=>{
      this._scriptsRenderer.removeScript({script});
    });
  }

  initAngularPageEvents(){
    this.angularPage.
      onAddRecipe(({recipe})=>{
        this._recipeRenderer.addRecipe({recipe});
      })
      .onRemoveRecipe(({recipe})=>{
        this._recipeRenderer.removeRecipe({recipe});
      })
			.onRoutesChage(({routesInstance})=>{
				// TODO: verify 1st call (archi)
				this._routesRenderer.render({routesInstance});
			});
  }
  initRecipeRenderer(){
    let recipeRendererContainer = document.createElement('div');
    this.panelContainer.appendChild(recipeRendererContainer);
    let recipeRenderer = new RecipeRenderer({
      container:recipeRendererContainer
    });

    return recipeRenderer;
  }
  initScriptRenderer(){
    let scriptsRendererContainer = document.createElement('div');
    this.panelContainer.appendChild(scriptsRendererContainer);
    let scriptsRenderer = new ScriptsRenderer({
			container: scriptsRendererContainer
		});

		let button  = document.createElement('button');
		button.innerText = 'Reorganise';
		button.onclick = ()=>{
			let selectedScripts = this._scriptsRenderer.getSelectedScripts();
			this.angularPage.reorganizeScripts({scripts: selectedScripts});
		};
		scriptsRendererContainer.appendChild(button);

    return scriptsRenderer;
	}
}


export default AngularPanel;
