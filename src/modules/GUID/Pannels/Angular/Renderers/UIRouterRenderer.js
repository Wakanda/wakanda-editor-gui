import helpers from '../../helpers';

class UIRouterRenderer{
	constructor({container, documentEditor}){
		this.documentEditor = documentEditor;
		this.container = container;

		this.container.appendChild(helpers.createTitle({text: 'Angular Routes : '}));
		this.buttonSelectElement = document.createElement('button');
		this.buttonSelectElement.innerText = 'Select view element';
		this.container.appendChild(this.buttonSelectElement);
		this.routesContainer =  document.createElement('div');
		this.container.appendChild(this.routesContainer);

	}
	renderViewElementButtons({viewElement}){
		this.buttonSelectElement.onclick = ()=>{
			this.documentEditor.selectElement({element : viewElement});
		};
	}
	render({uiRouterInstance}){
		let viewElement = uiRouterInstance.viewElement;

		if(viewElement){
			this.renderViewElementButtons({viewElement});
		}
		if(uiRouterInstance.states){
			this.renderRoutes({uiRouterInstance});
		}
	}
	renderRoutes({uiRouterInstance}){
		this.routesContainer.innerHTML = "";
		this.routesContainer.appendChild(helpers.createTitle({text: 'Routes : '}));
		let states = uiRouterInstance.states,
				otherwise = uiRouterInstance.otherwise;
		let onSelectView = ({value: state}) => {
			// TODO: daba fill content in dom
			// uiRouterInstance.selectView({path});
			let controllerName = uiRouterInstance.statesMap.get(path).controller;
		},onSave = ({value: path})=>{
			uiRouterInstance.saveTemplate({path})
		};
		let ul = document.createElement('ul');
		states.forEach((state)=>{
			let redioView = helpers.createRadioButton({
				groupName: 'selectViews',
				value: state,
				text: state,
				onChange: onSelectView,
				onClickSave: onSave
			});
			ul.appendChild(redioView);
		})
		this.routesContainer.appendChild(ul);
	}
}

export default UIRouterRenderer;
