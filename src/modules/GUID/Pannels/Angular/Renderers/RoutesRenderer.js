import helpers from '../../helpers';

class RoutesRenderer{
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
	render({routesInstance}){
		let viewElement = routesInstance.viewElement;

		if(viewElement){
			this.renderViewElementButtons({viewElement});
		}
		if(routesInstance.routes){
			this.renderRoutes({routesInstance});
		}
	}
	renderViewElementButtons({viewElement}){
		this.buttonSelectElement.onclick = ()=>{
			this.documentEditor.selectElement({element : viewElement});
		};
	}
	renderRoutes({routesInstance}){
		this.routesContainer.innerHTML = "";
		this.routesContainer.appendChild(helpers.createTitle({text: 'Routes : '}));
		let routes = routesInstance.routes,
				otherwise = routesInstance.routes;
		let onSelectView = ({value: path})=>{
			routesInstance.selectView({path});
			let controllerName = routesInstance.routes.get(path).controller;
		},onSave = ({value: path})=>{
			routesInstance.saveTemplate({path})
		};
		let ul = document.createElement('ul');
		routes.forEach((route, path)=>{
			let redioView = helpers.createRadioButton({
				groupName: 'selectViews',
				value: path,
				text: path,
				onChange: onSelectView,
				onClickSave: onSave
			});
			ul.appendChild(redioView);
		})
		this.routesContainer.appendChild(ul);
	}
}

export default RoutesRenderer;
