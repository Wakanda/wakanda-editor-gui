import AngularPage from './AngularPage';
import UIRouter from './UIRouter';
import {ScriptsRenderer, RecipeRenderer, UIRouterRenderer, ApplicationRenderer} from './Renderers';
import helpers from './helpers';

class AngularPanel{
  constructor({documentEditor, containerId, panelContainer}){
    this._documentEditor = documentEditor;
    this.panelContainer = panelContainer || document.getElementById(containerId);

		this._angularPage = new AngularPage({documentEditor});

    this._angularPage.ready.then((angularPage)=>{
      this._uiRouter = new UIRouter({angularPage});

      this._uiRouter.ready.then((uirouter)=>{
        this._uiRouterRenderer = this.initUIRouterRenderer();
      });

      this._applicationRenderer = this.initApplicationRenderer();
      this._scriptsRenderer = this.initScriptRenderer();
      this._scriptsRenderer.container.hidden = true;
      this._recipeRenderer = this.initRecipeRenderer();
      this._scriptsRenderer.container.hidden = true;

      this.initAngularPageEvents();
      this.listenToDocumentEditorEvents();
      this.initScripts();
      this.initAddButtons();
    });
  }
  get uiRouter(){
    return this._uiRouter;
  }
  initAddButtons(){
    let addControllerButton = document.createElement('button');
    addControllerButton.innerText = 'Add Controller';
    addControllerButton.onclick = ()=>{
      let newControllerName = prompt("Controller Name");
      let applicationName = this._angularPage.applicationName;
      // TODO: temporary
      let controllerCode = `
        (function(app){
          app.controller('${newControllerName}', ['$scope', function($scope){
            // your content here
          }]);
        })(angular.module('${applicationName}'));
      `;
      let controllerScript = this._documentEditor.scriptManager.createEmbdedScript({
        content: controllerCode,
        text: newControllerName
      });
      this._documentEditor.addScript({script: controllerScript});
    }
    this.panelContainer.appendChild(addControllerButton);
  }

  initApplicationRenderer(){
    let applicationRendererContainer = document.createElement('div');
    this.panelContainer.appendChild(applicationRendererContainer);

    let applicationRenderer = new ApplicationRenderer({
      container: applicationRendererContainer,
      documentEditor: this._documentEditor,
      angularPage: this._angularPage
    });

    return applicationRenderer;
  }

	initUIRouterRenderer(){
		let uiRouterRendererContainer = document.createElement('div');
		this.panelContainer.appendChild(uiRouterRendererContainer);

		let uiRouterRenderer = new UIRouterRenderer({
			container: uiRouterRendererContainer,
			documentEditor: this._documentEditor
		});

    uiRouterRenderer.render({uiRouterInstance: this.uiRouter})

    return uiRouterRenderer;
	}

	highlightControllerAndDependencies({controllersNames}){
		let controllers = controllersNames
			.map((controllerName)=>{
				return this._angularPage.getRecipeByName({name:controllerName});
			}).filter(helpers.isOk);
		this._recipeRenderer.highlightRecipes({recipes:controllers});

		let scripts = controllers
			.map((recipe)=>{
				return this._angularPage.getScriptOfRecipe({recipe});
			}).filter(helpers.isOk);
		this._scriptsRenderer.highlightScripts({scripts});

		let dependencies = this._angularPage.getDependenciesOfRecipes({recipes: controllers});
		this._recipeRenderer.highlightRecipes({recipes: dependencies, level: '1'});

		let dependenciesScripts = dependencies
			.map((recipe)=>{
				return this._angularPage.getScriptOfRecipe({recipe});
			}).filter(helpers.isOk);
		this._scriptsRenderer.highlightScripts({scripts: dependenciesScripts, level:'1'});

		let dependenciesDependencies = this._angularPage.getDependenciesOfRecipes({recipes: dependencies});
		this._recipeRenderer.highlightRecipes({recipes: dependenciesDependencies, level: '2'});

		let dependenciesDependenciesScripts = dependenciesDependencies
			.map((recipe)=>{
				return this._angularPage.getScriptOfRecipe({recipe});
			}).filter(helpers.isOk);
		this._scriptsRenderer.highlightScripts({scripts: dependenciesDependenciesScripts, level: '2'});
	}

	listenToDocumentEditorEvents(){
		this._documentEditor.onElementSelected(({element})=>{
			let elementNControllerName = helpers.getParentsWithAttribute({element, attribute: 'ng-controller'});

			let controllersNames = elementNControllerName.map(({controllerName})=>controllerName);

			this.highlightControllerAndDependencies({controllersNames});

		});
	}

  initScripts(){
    let scripts = this._documentEditor.scripts;
    this._scriptsRenderer.render({scripts});
    this._documentEditor.onAddScript(({script})=>{
      this._scriptsRenderer.addScript({script});
    });
    this._documentEditor.onRemoveScript(({script})=>{
      this._scriptsRenderer.removeScript({script});
    });
  }

  initAngularPageEvents(){
    this._angularPage.
      onAddRecipe(({recipe})=>{
        this._recipeRenderer.addRecipe({recipe});
      })
      .onRemoveRecipe(({recipe})=>{
        this._recipeRenderer.removeRecipe({recipe});
      });
    this._angularPage.recipes.forEach((recipe)=>{
      this._recipeRenderer.addRecipe({recipe});
    })
  }
  initRecipeRenderer(){
    let recipeRendererContainer = document.createElement('div');
    this.panelContainer.appendChild(recipeRendererContainer);
    let recipeRenderer = new RecipeRenderer({
      container:recipeRendererContainer,
      angularPage: this._angularPage
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
			this._angularPage.reorganizeScripts({scripts: selectedScripts});
		};
		scriptsRendererContainer.appendChild(button);

    return scriptsRenderer;
	}
}


export default AngularPanel;
